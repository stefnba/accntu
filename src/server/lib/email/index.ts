/**
 * # Next-Gen Email Service
 *
 * A powerful, type-safe, and developer-friendly email service for Node.js.
 *
 * ## Core Concepts
 *
 * 1.  **Decentralized Templates**: Email templates are defined as classes that extend
 *     `EmailConfig`. They live within the feature domain they belong to (e.g., `auth/email/`).
 *
 * 2.  **Type-Safe Senders**: The `emailService.createSender()` method generates a
 *     strongly-typed function for each template class. This provides compile-time
 *     safety for the data payload.
 *
 * 3.  **No Registration**: Templates are self-contained and require no central registration,
 *     which dramatically improves developer experience and reduces boilerplate.
 *
 * ## Quick Start
 *
 * ```typescript
 * // 1. Import the pre-configured service and your template class
 * import { emailService, EmailConfig } from '@/server/lib/email';
 * import { z } from 'zod';
 *
 * // 2. Define your template
 * class MyTestEmail extends EmailConfig {
 *   id = 'test-email';
 *   templatePath = 'templates/misc/test.njk';
 *   subjectKey = 'misc.test_subject';
 *   category = 'testing';
 *   description = 'A simple test email.';
 *   schema = z.object({ thing: z.string() });
 * }
 *
 * // 3. Create a sender and use it
 * const sendTestEmail = emailService.createSender(MyTestEmail);
 *
 * async function run() {
 *   await sendTestEmail({
 *     to: { email: 'test@example.com' },
 *     data: {
 *       thing: 'Hello from the new email service!'
 *     }
 *   });
 * }
 * ```
 */

import { z } from 'zod';
import { createEmailConfig, type EmailConfig } from './core/email-config';
import { EmailService, type EmailServiceConfig } from './core/email-service';
import {
    type EmailAddress,
    type EmailAttachment,
    type EmailProvider,
    type EmailSendResponse,
    type EmailSupportedProvider,
    type SendEmailOptions,
    type TemplateData,
    type TemplateEmailPayload,
    type TMailCategory,
} from './core/types';
import { type TMailtrapProviderConfig } from './providers/mailtrap';
import { type TResendProviderConfig } from './providers/resend';
import { type TSMTPProviderConfig } from './providers/smtp';

// =================================================================
// Exports
// =================================================================
export {
    createEmailConfig,
    EmailConfig,
    EmailService,
    type EmailAddress,
    type EmailAttachment,
    type EmailProvider,
    type EmailSendResponse,
    type EmailServiceConfig,
    type EmailSupportedProvider,
    type SendEmailOptions,
    type TemplateData,
    type TemplateEmailPayload,
    // Types
    type TMailCategory,
};

// =================================================================
// Environment Variable Schemas
// =================================================================

const baseEnvSchema = z.object({
    EMAIL_PROVIDER: z.enum(['resend', 'smtp', 'mailtrap']),
    EMAIL_FROM_NAME: z.string().optional(),
    EMAIL_FROM_ADDRESS: z.string().email(),
});

const resendEnvSchema = baseEnvSchema.extend({
    EMAIL_PROVIDER: z.literal('resend'),
    RESEND_API_KEY: z.string(),
});

const smtpEnvSchema = baseEnvSchema.extend({
    EMAIL_PROVIDER: z.literal('smtp'),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z.coerce.boolean().optional(),
});

const mailtrapEnvSchema = baseEnvSchema.extend({
    EMAIL_PROVIDER: z.literal('mailtrap'),
    MAILTRAP_HOST: z.string(),
    MAILTRAP_PORT: z.coerce.number(),
    MAILTRAP_USER: z.string(),
    MAILTRAP_PASS: z.string(),
});

const emailEnvSchema = z.discriminatedUnion('EMAIL_PROVIDER', [
    resendEnvSchema,
    smtpEnvSchema,
    mailtrapEnvSchema,
]);

// =================================================================
// Factory Function
// =================================================================

/**
 * Creates and configures an `EmailService` instance based on environment variables.
 *
 * This factory reads environment variables, validates them, and constructs the
 * appropriate provider configuration. It's the recommended way to instantiate
 * the email service.
 *
 * @param env - The environment variables object (e.g., `process.env`).
 * @returns A new instance of `EmailService`.
 * @throws If the environment variables are invalid or missing.
 */
export function createEmailServiceFromEnv(env: NodeJS.ProcessEnv = process.env): EmailService {
    const parsedEnv = emailEnvSchema.safeParse(env);
    if (!parsedEnv.success) {
        throw new Error(`Invalid email environment variables: ${parsedEnv.error.message}`);
    }

    const { data: envData } = parsedEnv;
    const fromAddress: EmailAddress = {
        email: envData.EMAIL_FROM_ADDRESS,
        name: envData.EMAIL_FROM_NAME,
    };

    let providerConfig: EmailServiceConfig;

    switch (envData.EMAIL_PROVIDER) {
        case 'resend': {
            const resendConfig: TResendProviderConfig = { apiKey: envData.RESEND_API_KEY };
            providerConfig = {
                provider: 'resend',
                from: fromAddress,
                resend: resendConfig,
            };
            break;
        }
        case 'smtp': {
            const smtpConfig: TSMTPProviderConfig = {
                host: envData.SMTP_HOST,
                port: envData.SMTP_PORT,
                username: envData.SMTP_USER,
                password: envData.SMTP_PASS,
                secure: envData.SMTP_SECURE,
            };
            providerConfig = {
                provider: 'smtp',
                from: fromAddress,
                smtp: smtpConfig,
            };
            break;
        }
        case 'mailtrap': {
            const mailtrapConfig: TMailtrapProviderConfig = {
                host: envData.MAILTRAP_HOST,
                port: envData.MAILTRAP_PORT,
                username: envData.MAILTRAP_USER,
                password: envData.MAILTRAP_PASS,
            };
            providerConfig = {
                provider: 'mailtrap',
                from: fromAddress,
                mailtrap: mailtrapConfig,
            };
            break;
        }
        default:
            // This case should be unreachable due to Zod validation
            throw new Error('Unsupported email provider specified in environment.');
    }

    return new EmailService(providerConfig);
}

/**
 * A pre-configured, singleton instance of the `EmailService`.
 *
 * This instance is ready to use immediately. It is configured from
 * environment variables.
 */
export const emailService = createEmailServiceFromEnv();
