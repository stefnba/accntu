import type { TMailtrapProviderConfig } from '../providers/mailtrap';
import type { TResendProviderConfig } from '../providers/resend';
import type { TSMTPProviderConfig } from '../providers/smtp';
import { TemplateEngineConfig } from './template-engine';
import type { EmailAddress } from './types';

type ProviderConfig<T extends string, C> = {
    provider: T;
    config: C;
};

// Individual provider configurations
type ResendServiceConfig = ProviderConfig<'resend', TResendProviderConfig>;
type SmtpServiceConfig = ProviderConfig<'smtp', TSMTPProviderConfig>;
type MailtrapServiceConfig = ProviderConfig<'mailtrap', TMailtrapProviderConfig>;

// Discriminated union of all possible provider configs
type ProviderServiceConfig = ResendServiceConfig | SmtpServiceConfig | MailtrapServiceConfig;

/**
 * ## Email Service Configuration
 *
 * Defines the complete configuration for the EmailService, including the
 * 'from' address and the provider-specific settings.
 */
export type EmailServiceConfig = {
    from: EmailAddress;
    replyTo?: EmailAddress;
    templateEngine?: TemplateEngineConfig;
} & ProviderServiceConfig;
