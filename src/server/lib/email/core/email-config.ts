import { z } from 'zod';
import type { EmailAddress } from './types';
import { type TMailCategory } from './types';

/**
 * ## Email Config
 *
 * Defines the static configuration for an email template.
 *
 * This object provides a standardized, type-safe structure for all emails.
 */
export type EmailConfig<T extends z.ZodType = z.ZodType> = {
    /** A unique identifier for the email template (e.g., 'welcome-email'). */
    readonly id: string;

    /** The file path to the Nunjucks template, relative to the `src` directory. */
    readonly templatePath: string;

    /** The key for the email subject line used for internationalization. */
    readonly subjectKey: string;

    /** The Zod schema for validating the template's data payload. */
    readonly schema: T;

    /** The default locale to use if one is not provided. */
    readonly defaultLocale: string;

    /** A category for organizing email types. */
    readonly category: TMailCategory;

    /** A brief description of the email's purpose. */
    readonly description: string;
};

export type CreateEmailConfigParams<T extends z.ZodType> = Omit<EmailConfig<T>, 'defaultLocale'> & {
    defaultLocale?: string;
};

/**
 * Factory function to create a new email configuration object.
 *
 * This is the recommended way to define an email template. It ensures all
 * required fields are present and sets a default locale if not provided.
 *
 * @param config The email configuration parameters.
 * @returns A full EmailConfig object.
 */
export function createEmailConfig<T extends z.ZodType>(
    config: CreateEmailConfigParams<T>
): EmailConfig<T> {
    return {
        ...config,
        defaultLocale: config.defaultLocale || 'en',
    };
}

/**
 * Infers the data type from an EmailConfig class.
 *
 * @example
 * ```typescript
 * type WelcomeEmailData = TemplateData<typeof WelcomeEmail>;
 * // Result: { user: { name: string } }
 * ```
 */
export type TemplateData<T extends new (...args: any[]) => EmailConfig> = z.infer<
    InstanceType<T>['schema']
>;

/**
 * Represents the data required to send a templated email.
 * @template T - The template-specific data type.
 */
export interface TemplateEmailPayload<TData> {
    /**
     * The recipient or list of recipients.
     */
    to: EmailAddress | EmailAddress[];

    /**
     * The type-safe data payload required by the template's schema.
     */
    data: TData;

    /**
     * The locale (e.g., 'en', 'es') to use for rendering the template.
     * Overrides the template's `defaultLocale`.
     */
    locale?: string;

    /**
     * A custom 'from' address for this specific email.
     * Overrides the service's default 'from' address.
     */
    from?: EmailAddress;

    /**
     * A custom 'reply-to' address for this specific email.
     * Overrides the service's default 'reply-to' address.
     */
    replyTo?: EmailAddress;

    /**
     * Custom tags for tracking and analytics. These are merged with default tags.
     */
    tags?: Record<string, string>;

    /**
     * Custom email headers.
     */
    headers?: Record<string, string>;
}
