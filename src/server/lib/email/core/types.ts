import type { z } from 'zod';
import type { EmailConfig } from './email-config';

// =================================================================
// Basic Email Types
// =================================================================

/** An email address with an optional name. */
export interface EmailAddress {
    email: string;
    name?: string;
}

/** Email attachment configuration. */
export interface EmailAttachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
}

/** The response from an email provider after sending an email. */
export interface EmailSendResponse {
    success: boolean;
    id: string;
    error?: string;
}

/** Generic options for sending an email, adaptable to any provider. */
export interface SendEmailOptions {
    to: EmailAddress | EmailAddress[];
    from: EmailAddress;
    subject: string;
    html: string;
    text?: string;
    replyTo?: EmailAddress;
    headers?: Record<string, string>;
    attachments?: EmailAttachment[];
    tags?: Record<string, string>;
}

// =================================================================
// Template-Related Types
// =================================================================

/** A category for organizing email types. */
export type TMailCategory = 'authentication' | 'billing' | 'notifications' | 'marketing' | 'other';

/** Utility to infer the data type from an EmailConfig object. */
export type TemplateData<T extends EmailConfig> = z.infer<T['schema']>;

/** The payload required for sending a templated email. */
export interface TemplateEmailPayload<TData> {
    to: EmailAddress | EmailAddress[];
    data: TData;
    from?: EmailAddress;
    replyTo?: EmailAddress;
    locale?: string;
    headers?: Record<string, string>;
    tags?: Record<string, string>;
}

/**
 * Data object for template rendering with flexible value types.
 *
 * This type is intentionally loose to accommodate various data structures
 * passed to templates. It's up to the template's Zod schema to enforce
 * the actual structure.
 */
export type TemplateRenderData = Record<string, unknown>;

// =================================================================
// Provider-Related Types
// =================================================================

/** Supported email provider types */
export type EmailSupportedProvider = 'resend' | 'postmark' | 'smtp' | 'mailtrap';

/**
 * Interface that all email provider classes must implement.
 *
 * It defines the essential methods for sending emails and validating
 * configuration, ensuring a consistent API across all providers.
 */
export interface EmailProvider {
    /** The unique name of the provider (e.g., 'resend', 'smtp') */
    name: EmailSupportedProvider;
    /** Method to send an email */
    sendEmail(options: SendEmailOptions): Promise<EmailSendResponse>;
}
