import { getEnv } from '@/lib/env';
import { EmailService } from './email-service';

// =================================================================
// Factory Function
// =================================================================

/**
 * Creates and configures an `EmailService` instance based on validated environment variables.
 *
 * This factory uses the centralized environment configuration to construct the
 * appropriate provider configuration. It's the recommended way to instantiate
 * the email service.
 *
 * @returns A new instance of `EmailService`.
 * @throws If the environment variables are invalid or missing.
 */
export function createEmailService(): EmailService {
    const envData = getEnv('server');

    const provider = envData.EMAIL_PROVIDER;

    if (envData.EMAIL_PROVIDER === 'resend') {
        return new EmailService({
            provider: 'resend',
            from: {
                email: envData.EMAIL_FROM_ADDRESS,
                name: envData.EMAIL_FROM_NAME,
            },
            config: { apiKey: envData.RESEND_API_KEY },
        });
    }

    if (envData.EMAIL_PROVIDER === 'smtp') {
        return new EmailService({
            provider: 'smtp',
            from: {
                email: envData.EMAIL_FROM_ADDRESS,
                name: envData.EMAIL_FROM_NAME,
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

    if (envData.EMAIL_PROVIDER === 'mailtrap') {
        return new EmailService({
            provider: 'mailtrap',
            from: {
                email: envData.EMAIL_FROM_ADDRESS,
                name: envData.EMAIL_FROM_NAME,
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
