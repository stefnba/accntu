import { EmailProvider, EmailSupportedProvider } from '@/server/lib/email/core/types';
import { mailTrapConfigSchema, MailtrapProvider, TMailtrapProviderConfig } from './mailtrap';
import { resendConfigSchema, ResendProvider, TResendProviderConfig } from './resend';
import { smtpConfigSchema, SMTPProvider, TSMTPProviderConfig } from './smtp';

/**
 * Creates an email provider instance based on the specified type and configuration.
 *
 * This factory uses function overloads to provide strong type-safety. It ensures
 * that the configuration object passed matches the requirements of the requested
 * provider type. If the configuration is invalid, it throws a Zod validation error.
 *
 * @param type - The type of provider to create ('resend', 'smtp', 'mailtrap').
 * @param config - The configuration object for the specified provider.
 * @returns An instance of the requested email provider.
 * @throws If the configuration does not match the provider's schema.
 */
export function createProvider(type: 'resend', config: TResendProviderConfig): EmailProvider;
export function createProvider(type: 'smtp', config: TSMTPProviderConfig): EmailProvider;
export function createProvider(type: 'mailtrap', config: TMailtrapProviderConfig): EmailProvider;
export function createProvider(type: EmailSupportedProvider, config: unknown): EmailProvider {
    switch (type) {
        case 'resend':
            return new ResendProvider(resendConfigSchema.parse(config));
        case 'smtp':
            return new SMTPProvider(smtpConfigSchema.parse(config));
        case 'mailtrap':
            return new MailtrapProvider(mailTrapConfigSchema.parse(config));
        default:
            // This case should be unreachable due to TypeScript's type checking
            throw new Error(`Unsupported email provider type: ${type}`);
    }
}
