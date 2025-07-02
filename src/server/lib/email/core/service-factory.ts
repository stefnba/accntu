import { z } from 'zod';
import { EmailService } from './email-service';

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
export function createEmailService(env: NodeJS.ProcessEnv = process.env): EmailService {
    const parsedEnv = emailEnvSchema.safeParse(env);
    if (!parsedEnv.success) {
        throw new Error(`Invalid email environment variables: ${parsedEnv.error.message}`);
    }

    const envData = parsedEnv.data;

    const {
        EMAIL_PROVIDER: provider,
        EMAIL_FROM_ADDRESS: emailFromAddress,
        EMAIL_FROM_NAME: emailFromName,
    } = envData;

    if (provider === 'resend') {
        return new EmailService({
            provider: 'resend',
            from: {
                email: emailFromAddress,
                name: emailFromName,
            },
            config: { apiKey: envData.RESEND_API_KEY },
        });
    }

    if (provider === 'smtp') {
        return new EmailService({
            provider: 'smtp',
            from: {
                email: emailFromAddress,
                name: emailFromName,
            },
            config: {
                host: envData.SMTP_HOST,
                port: envData.SMTP_PORT,
                username: envData.SMTP_USER,
                password: envData.SMTP_PASS,
                secure: envData.SMTP_SECURE,
            },
        });
    }

    if (provider === 'mailtrap') {
        return new EmailService({
            provider: 'mailtrap',
            from: {
                email: emailFromAddress,
                name: emailFromName,
            },
            config: {
                host: envData.MAILTRAP_HOST,
                port: envData.MAILTRAP_PORT,
                username: envData.MAILTRAP_USER,
                password: envData.MAILTRAP_PASS,
            },
        });
    }

    throw new Error(`Unsupported email provider: ${provider}`);
}
