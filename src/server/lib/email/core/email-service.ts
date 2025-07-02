import { z } from 'zod';
import { createProvider } from '../providers/factory';
import { createEmailConfig, CreateEmailConfigParams, EmailConfig } from './email-config';
import type { EmailServiceConfig } from './email-service-config';
import { EmailTemplateEngine } from './template-engine';
import {
    EmailAddress,
    EmailProvider,
    EmailSendResponse,
    SendEmailOptions,
    TemplateData,
    TemplateEmailPayload,
    TemplateRenderData,
} from './types';

/**
 * A powerful, type-safe email service for sending templated emails.
 *
 * This service uses a factory-based, decentralized approach to templates.
 * Instead of registering templates, you create a sender function for each
 * template config, ensuring full type-safety from end to end.
 *
 * @example
 * ```typescript
 * // 1. Define your template class
 * class WelcomeEmail extends EmailConfig {
 *   id = 'welcome';
 *   templatePath = 'auth/welcome.njk';
 *   subjectKey = 'auth.welcome_subject';
 *   schema = z.object({ user: z.object({ name: z.string() }) });
 *   category = 'authentication';
 *   description = 'Email sent to new users.';
 * }
 *
 * // 2. Create a type-safe sender
 * const sendWelcomeEmail = emailService.createSender(WelcomeEmail);
 *
 * // 3. Use the sender
 * await sendWelcomeEmail({
 *   to: { email: 'user@example.com' },
 *   data: {
 *     user: { name: 'Stefan' }
 *   }
 * });
 * ```
 */
export class EmailService {
    private provider: EmailProvider;
    private templateEngine: EmailTemplateEngine;
    private config: EmailServiceConfig;

    constructor(config: EmailServiceConfig) {
        this.config = config;
        this.templateEngine = new EmailTemplateEngine(config.templateEngine);

        // This type-safe switch ensures the correct config is passed to the provider
        switch (config.provider) {
            case 'resend':
                this.provider = createProvider('resend', config.config);
                break;
            case 'smtp':
                this.provider = createProvider('smtp', config.config);
                break;
            case 'mailtrap':
                this.provider = createProvider('mailtrap', config.config);
                break;
            default:
                // This case should be unreachable due to TypeScript's type checking
                throw new Error('Unsupported email provider specified in constructor');
        }
    }

    /**
     * Creates a strongly-typed sender function for a given EmailConfig object.
     *
     * This is the recommended way to send emails. It provides full type-safety
     * for the `data` payload based on the template's schema.
     *
     * @param config The `EmailConfig` object for the email to be sent.
     * @returns An async function that accepts a `to` address and the template `data`.
     */
    createSender<T extends EmailConfig>(
        config: T
    ): (payload: TemplateEmailPayload<TemplateData<T>>) => Promise<EmailSendResponse> {
        return (payload: TemplateEmailPayload<TemplateData<T>>) => this.send(config, payload);
    }

    /**
     * Creates an email config and a strongly-typed sender function in one step.
     *
     * @param config The email configuration parameters.
     * @returns An async function that accepts a `to` address and the template `data`.
     */
    createSenderFromConfig<T extends z.ZodType>(
        config: CreateEmailConfigParams<T>
    ): (payload: TemplateEmailPayload<TemplateData<EmailConfig<T>>>) => Promise<EmailSendResponse> {
        const emailConfig = createEmailConfig(config);
        return this.createSender(emailConfig);
    }

    /**
     * Sends an email using an instance of an EmailConfig.
     *
     * This is the core method for sending templated emails. It's recommended
     * to use the `createSender` factory for a better developer experience.
     *
     * @param config An instance of an EmailConfig.
     * @param payload The email data, including recipient and template data.
     * @returns A promise that resolves with the response from the email provider.
     */
    async send<TData extends TemplateRenderData>(
        config: EmailConfig<any>,
        payload: TemplateEmailPayload<TData>
    ): Promise<EmailSendResponse> {
        try {
            // 1. Validate data against the template's schema
            const validatedData = config.schema.parse(payload.data);

            // 2. Determine the locale
            const locale = payload.locale || config.defaultLocale;

            // 3. Render the HTML and text content
            const content = await this.templateEngine.render(config, validatedData, locale);

            // 4. Construct the final email options
            const emailOptions: SendEmailOptions = {
                to: payload.to,
                from: payload.from || this.config.from,
                replyTo: payload.replyTo || this.config.replyTo,
                subject: content.subject,
                html: content.html,
                text: content.text,
                tags: {
                    config: config.id,
                    category: config.category,
                    locale,
                    ...payload.tags,
                },
                headers: payload.headers,
            };

            // 5. Send the email via the configured provider
            const providerResponse = await this.provider.sendEmail(emailOptions);
            return {
                ...providerResponse,
                emailConfigId: config.id,
                category: config.category,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // TODO: Add error logging
            console.error(`Failed to send email '${config.id}': ${errorMessage}`, {
                templateId: config.id,
                error,
            });
            return {
                providerMessageId: '',
                success: false,
                error: `Failed to send templated email '${config.id}': ${errorMessage}`,
                provider: this.config.provider,
                emailConfigId: config.id,
                category: config.category,
            };
        }
    }

    /**
     * Renders an email template to HTML and text for previewing.
     *
     * This method is useful for development and testing, allowing you to see
     * how an email will look without actually sending it.
     *
     * @param template An instance of an EmailConfig.
     * @param payload The data required by the template.
     * @returns The rendered subject, HTML, and text content.
     */
    async preview<TData extends TemplateRenderData>(
        template: EmailConfig<any>,
        payload: TemplateEmailPayload<TData>
    ): Promise<{ subject: string; html: string; text: string }> {
        const validatedData = template.schema.parse(payload.data) as TData;
        const locale = payload.locale || template.defaultLocale;
        return this.templateEngine.render(template, validatedData, locale);
    }

    /**
     * Sends a raw email without using a template.
     * @param options The email options.
     */
    async sendRawEmail(
        options: Omit<SendEmailOptions, 'from'> & { from?: EmailAddress }
    ): Promise<EmailSendResponse> {
        const emailOptions: SendEmailOptions = {
            ...options,
            from: options.from || this.config.from,
        };

        if (this.config.replyTo && !emailOptions.replyTo) {
            emailOptions.replyTo = this.config.replyTo;
        }

        const providerResponse = await this.provider.sendEmail(emailOptions);
        return {
            ...providerResponse,
            emailConfigId: '',
            category: 'other',
        };
    }
}
