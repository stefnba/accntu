import { createProvider } from '../providers/factory';
import { EmailConfig } from './email-config';
import { EmailTemplateEngine } from './template-engine';
import {
    EmailAddress,
    EmailProvider,
    EmailSendResponse,
    EmailSupportedProvider,
    SendEmailOptions,
    TemplateData,
    TemplateEmailPayload,
    TemplateRenderData,
} from './types';

/**
 * Configuration for the EmailService.
 */
export interface EmailServiceConfig {
    provider: EmailSupportedProvider;
    resend?: { apiKey: string };
    smtp?: {
        host: string;
        port: number;
        username?: string;
        password?: string;
        secure?: boolean;
    };
    mailtrap?: {
        host: string;
        port: number;
        username: string;
        password: string;
    };
    from: EmailAddress;
    replyTo?: EmailAddress;
    templateEngine?: {
        rootDir?: string;
        locales?: string[];
        localesDir?: string;
        cssPath?: string;
        enableCache?: boolean;
    };
}

/**
 * A powerful, type-safe email service for sending templated emails.
 *
 * This service uses a class-based, decentralized approach to templates.
 * Instead of registering templates, you create a sender function for each
 * template class, ensuring full type-safety from end to end.
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

        switch (config.provider) {
            case 'resend':
                if (!config.resend) throw new Error('Resend config not provided');
                this.provider = createProvider('resend', config.resend);
                break;
            case 'smtp':
                if (!config.smtp) throw new Error('SMTP config not provided');
                this.provider = createProvider('smtp', config.smtp);
                break;
            case 'mailtrap':
                if (!config.mailtrap) throw new Error('Mailtrap config not provided');
                this.provider = createProvider('mailtrap', config.mailtrap);
                break;
            default:
                throw new Error(`Unsupported email provider: ${config.provider}`);
        }
    }

    /**
     * Creates a strongly-typed sender function for a given EmailConfig object.
     *
     * This is the recommended way to send emails. It provides full type-safety
     * for the `data` payload based on the template's schema.
     *
     * @param template The `EmailConfig` object for the email to be sent.
     * @returns An async function that accepts a `to` address and the template `data`.
     */
    createSender<T extends EmailConfig>(
        template: T
    ): (payload: TemplateEmailPayload<TemplateData<T>>) => Promise<EmailSendResponse> {
        return (payload: TemplateEmailPayload<TemplateData<T>>) => this.send(template, payload);
    }

    /**
     * Sends an email using an instance of an EmailConfig.
     *
     * This is the core method for sending templated emails. It's recommended
     * to use the `createSender` factory for a better developer experience.
     *
     * @param template An instance of an EmailConfig.
     * @param payload The email data, including recipient and template data.
     * @returns A promise that resolves with the response from the email provider.
     */
    async send<TData extends TemplateRenderData>(
        template: EmailConfig<any>,
        payload: TemplateEmailPayload<TData>
    ): Promise<EmailSendResponse> {
        try {
            // 1. Validate data against the template's schema
            const validatedData = template.schema.parse(payload.data);

            // 2. Determine the locale
            const locale = payload.locale || template.defaultLocale;

            // 3. Render the HTML and text content
            const content = await this.templateEngine.render(template, validatedData, locale);

            // 4. Construct the final email options
            const emailOptions: SendEmailOptions = {
                to: payload.to,
                from: payload.from || this.config.from,
                replyTo: payload.replyTo || this.config.replyTo,
                subject: content.subject,
                html: content.html,
                text: content.text,
                tags: {
                    template: template.id,
                    category: template.category,
                    locale,
                    ...payload.tags,
                },
                headers: payload.headers,
            };

            // 5. Send the email via the configured provider
            return await this.provider.sendEmail(emailOptions);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Failed to send email template '${template.id}': ${errorMessage}`, {
                templateId: template.id,
                error,
            });
            return {
                id: '',
                success: false,
                error: `Failed to send templated email '${template.id}': ${errorMessage}`,
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

        return this.provider.sendEmail(emailOptions);
    }
}
