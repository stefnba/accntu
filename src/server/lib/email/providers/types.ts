/**
 * Email attachment configuration
 */
export interface EmailAttachment {
  /** Name of the attachment file */
  filename: string;
  /** File content as string or Buffer */
  content: string | Buffer;
  /** MIME type of the attachment (e.g., 'image/png', 'application/pdf') */
  contentType?: string;
  /** Content encoding (e.g., 'base64', 'binary') */
  encoding?: string;
}

/**
 * Email address with optional display name
 */
export interface EmailAddress {
  /** Email address (required) */
  email: string;
  /** Display name for the email address (optional) */
  name?: string;
}

/**
 * Rendered email content with HTML, text, and subject
 */
export interface EmailContent {
  /** HTML version of the email */
  html: string;
  /** Plain text version of the email */
  text: string;
  /** Email subject line */
  subject: string;
}

/**
 * Options for sending an email through any provider
 */
export interface SendEmailOptions {
  /** Recipient(s) - single address or array of addresses */
  to: EmailAddress | EmailAddress[];
  /** Sender address */
  from: EmailAddress;
  /** Reply-to address (optional) */
  replyTo?: EmailAddress;
  /** Email subject line */
  subject: string;
  /** HTML content of the email */
  html: string;
  /** Plain text content of the email */
  text: string;
  /** File attachments (optional) */
  attachments?: EmailAttachment[];
  /** Custom tags for tracking/categorization (optional) */
  tags?: Record<string, string>;
  /** Custom email headers (optional) */
  headers?: Record<string, string>;
}

/**
 * Response from email provider after sending attempt
 */
export interface EmailSendResponse {
  /** Unique identifier for the sent email (from provider) */
  id: string;
  /** Whether the email was sent successfully */
  success: boolean;
  /** Success message (optional) */
  message?: string;
  /** Error message if sending failed (optional) */
  error?: string;
}

/**
 * Configuration for email providers
 */
export interface EmailProviderConfig {
  /** API key for service-based providers (Resend, Postmark, etc.) */
  apiKey?: string;
  /** Domain for providers that require domain verification */
  domain?: string;
  /** SMTP host for SMTP-based providers */
  host?: string;
  /** SMTP port for SMTP-based providers */
  port?: number;
  /** SMTP username for authentication */
  username?: string;
  /** SMTP password for authentication */
  password?: string;
  /** Whether to use secure connection (TLS/SSL) */
  secure?: boolean;
  /** Default sender address */
  from?: EmailAddress;
}

/**
 * Abstract interface that all email providers must implement
 */
export interface EmailProvider {
  /** Human-readable name of the provider */
  name: string;
  
  /**
   * Send an email through this provider
   * @param options Email sending options
   * @returns Promise resolving to send response
   */
  sendEmail(options: SendEmailOptions): Promise<EmailSendResponse>;
  
  /**
   * Validate that the provider configuration is complete and valid
   * @returns True if configuration is valid, false otherwise
   */
  validateConfig(): boolean;
}

/** Supported email provider types */
export type EmailProviderType = 'resend' | 'postmark' | 'smtp' | 'mailtrap';

/**
 * Data object for template rendering with flexible value types
 */
export interface TemplateData {
  [key: string]: string | number | boolean | object | null | undefined;
}

/**
 * Email template configuration for rendering
 */
export interface EmailTemplate {
  /** Template name/path (e.g., 'auth/otp', 'notifications/transaction') */
  name: string;
  /** Subject line template key for i18n lookup */
  subject: string;
  /** Locale for internationalization (defaults to 'en') */
  locale?: string;
  /** Data to be passed to the template for rendering */
  data: TemplateData;
}