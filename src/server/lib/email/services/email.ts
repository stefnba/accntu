import { ResendProvider } from '../providers/resend';
import { SMTPProvider } from '../providers/smtp';
import { MailtrapProvider } from '../providers/mailtrap';
import { EmailTemplateService } from './template';
import { 
  EmailProvider, 
  EmailProviderConfig, 
  EmailProviderType, 
  EmailSendResponse, 
  SendEmailOptions,
  EmailAddress,
  EmailTemplate 
} from '../providers/types';

/**
 * Configuration for the EmailService
 */
export interface EmailServiceConfig {
  /** Email provider to use ('resend', 'smtp', or 'mailtrap') */
  provider: EmailProviderType;
  /** Resend configuration (required if provider is 'resend') */
  resend?: {
    apiKey: string;
  };
  /** SMTP configuration (required if provider is 'smtp') */
  smtp?: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    secure?: boolean;
  };
  /** Mailtrap configuration (required if provider is 'mailtrap') */
  mailtrap?: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  /** Default sender address for all emails */
  from: EmailAddress;
  /** Default reply-to address (optional) */
  replyTo?: EmailAddress;
}

/**
 * Main email service that orchestrates providers and templates
 * 
 * This service provides a unified interface for sending emails through
 * different providers (Resend, SMTP, Mailtrap) and rendering templates
 * with Jinja2-style syntax.
 * 
 * Features:
 * - Multi-provider support with configuration-based switching
 * - Template rendering with internationalization
 * - Type-safe email sending with comprehensive error handling
 * - Convenient methods for common email types (OTP, welcome, etc.)
 * 
 * @example
 * ```typescript
 * const emailService = new EmailService({
 *   provider: 'resend',
 *   resend: { apiKey: 'your-api-key' },
 *   from: { email: 'noreply@yourdomain.com', name: 'Your App' }
 * });
 * 
 * // Send OTP email
 * await emailService.sendOTPEmail(user, '123456');
 * 
 * // Send custom templated email
 * await emailService.sendTemplatedEmail(
 *   { email: 'user@example.com', name: 'John' },
 *   { name: 'custom/template', subject: 'custom.subject', data: { ... } }
 * );
 * ```
 */
export class EmailService {
  private provider: EmailProvider;
  private templateService: EmailTemplateService;
  private config: EmailServiceConfig;

  /**
   * Initialize the email service with provider configuration
   * 
   * @param config - Email service configuration
   * @throws {Error} When provider configuration is invalid or missing required fields
   * 
   * @example
   * ```typescript
   * // Resend configuration
   * const service = new EmailService({
   *   provider: 'resend',
   *   resend: { apiKey: 're_your_api_key' },
   *   from: { email: 'noreply@yourdomain.com', name: 'Your App' }
   * });
   * 
   * // Mailtrap configuration (for development)
   * const devService = new EmailService({
   *   provider: 'mailtrap',
   *   mailtrap: {
   *     host: 'sandbox.smtp.mailtrap.io',
   *     port: 2525,
   *     username: 'your-username',
   *     password: 'your-password'
   *   },
   *   from: { email: 'test@example.com', name: 'Test App' }
   * });
   * ```
   */
  constructor(config: EmailServiceConfig) {
    this.config = config;
    this.templateService = new EmailTemplateService();
    this.provider = this.createProvider(config);

    if (!this.provider.validateConfig()) {
      throw new Error(`Invalid configuration for ${config.provider} email provider`);
    }
  }

  /**
   * Creates the appropriate email provider based on configuration
   * 
   * @param config - Email service configuration
   * @returns {EmailProvider} Configured email provider instance
   * @throws {Error} When provider type is unsupported or configuration is invalid
   * @private
   */
  private createProvider(config: EmailServiceConfig): EmailProvider {
    const providerConfig: EmailProviderConfig = {
      from: config.from,
    };

    switch (config.provider) {
      case 'resend':
        if (!config.resend?.apiKey) {
          throw new Error('Resend API key is required');
        }
        return new ResendProvider({
          ...providerConfig,
          apiKey: config.resend.apiKey,
        });

      case 'smtp':
        if (!config.smtp?.host || !config.smtp?.port) {
          throw new Error('SMTP host and port are required');
        }
        return new SMTPProvider({
          ...providerConfig,
          host: config.smtp.host,
          port: config.smtp.port,
          username: config.smtp.username,
          password: config.smtp.password,
          secure: config.smtp.secure,
        });

      case 'mailtrap':
        if (!config.mailtrap?.host || !config.mailtrap?.port || !config.mailtrap?.username || !config.mailtrap?.password) {
          throw new Error('Mailtrap host, port, username, and password are required');
        }
        return new MailtrapProvider({
          ...providerConfig,
          host: config.mailtrap.host,
          port: config.mailtrap.port,
          username: config.mailtrap.username,
          password: config.mailtrap.password,
        });

      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }
  }

  /**
   * Sends an email using the configured provider
   * 
   * @param options - Email sending options (from address is optional, defaults to config)
   * @returns {Promise<EmailSendResponse>} Response indicating success/failure
   * 
   * @example
   * ```typescript
   * const response = await emailService.sendEmail({
   *   to: { email: 'user@example.com', name: 'John Doe' },
   *   subject: 'Custom Email',
   *   html: '<h1>Hello!</h1>',
   *   text: 'Hello!',
   *   tags: { type: 'custom' }
   * });
   * 
   * if (response.success) {
   *   console.log('Email sent:', response.id);
   * }
   * ```
   */
  async sendEmail(options: Omit<SendEmailOptions, 'from'> & { from?: EmailAddress }): Promise<EmailSendResponse> {
    const emailOptions: SendEmailOptions = {
      ...options,
      from: options.from || this.config.from,
    };

    if (this.config.replyTo && !emailOptions.replyTo) {
      emailOptions.replyTo = this.config.replyTo;
    }

    return this.provider.sendEmail(emailOptions);
  }

  async sendTemplatedEmail(
    to: EmailAddress | EmailAddress[],
    template: EmailTemplate,
    options?: {
      from?: EmailAddress;
      replyTo?: EmailAddress;
      tags?: Record<string, string>;
      headers?: Record<string, string>;
    }
  ): Promise<EmailSendResponse> {
    try {
      const { html, text, subject } = await this.templateService.renderTemplate(template);

      return this.sendEmail({
        to,
        subject,
        html,
        text,
        from: options?.from,
        replyTo: options?.replyTo,
        tags: options?.tags,
        headers: options?.headers,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        id: '',
        success: false,
        error: `Failed to send templated email: ${errorMessage}`,
      };
    }
  }

  /**
   * Sends an OTP (One-Time Password) verification email
   * 
   * @param user - User object containing name and email
   * @param otpCode - The OTP code to send
   * @param locale - Locale for internationalization (defaults to 'en')
   * @returns {Promise<EmailSendResponse>} Response indicating success/failure
   * 
   * @example
   * ```typescript
   * const response = await emailService.sendOTPEmail(
   *   { name: 'John Doe', email: 'john@example.com' },
   *   '123456',
   *   'en'
   * );
   * 
   * if (response.success) {
   *   console.log('OTP email sent successfully');
   * } else {
   *   console.error('Failed to send OTP:', response.error);
   * }
   * ```
   */
  async sendOTPEmail(
    user: { name: string; email: string },
    otpCode: string,
    locale = 'en'
  ): Promise<EmailSendResponse> {
    try {
      const { html, text, subject } = await this.templateService.renderOTPEmail(user, otpCode, locale);

      return this.sendEmail({
        to: { email: user.email, name: user.name },
        subject,
        html,
        text,
        tags: {
          type: 'otp',
          locale,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        id: '',
        success: false,
        error: `Failed to send OTP email: ${errorMessage}`,
      };
    }
  }

  async sendWelcomeEmail(
    user: { name: string; email: string },
    locale = 'en'
  ): Promise<EmailSendResponse> {
    try {
      const { html, text, subject } = await this.templateService.renderWelcomeEmail(user, locale);

      return this.sendEmail({
        to: { email: user.email, name: user.name },
        subject,
        html,
        text,
        tags: {
          type: 'welcome',
          locale,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        id: '',
        success: false,
        error: `Failed to send welcome email: ${errorMessage}`,
      };
    }
  }

  async sendPasswordResetEmail(
    user: { name: string; email: string },
    resetLink: string,
    locale = 'en'
  ): Promise<EmailSendResponse> {
    try {
      const { html, text, subject } = await this.templateService.renderPasswordResetEmail(user, resetLink, locale);

      return this.sendEmail({
        to: { email: user.email, name: user.name },
        subject,
        html,
        text,
        tags: {
          type: 'password_reset',
          locale,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        id: '',
        success: false,
        error: `Failed to send password reset email: ${errorMessage}`,
      };
    }
  }

  async sendTransactionNotificationEmail(
    user: { name: string; email: string },
    transaction: { amount: number; description: string; date: string },
    locale = 'en'
  ): Promise<EmailSendResponse> {
    try {
      const { html, text, subject } = await this.templateService.renderTransactionNotificationEmail(
        user,
        transaction,
        locale
      );

      return this.sendEmail({
        to: { email: user.email, name: user.name },
        subject,
        html,
        text,
        tags: {
          type: 'transaction_notification',
          locale,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        id: '',
        success: false,
        error: `Failed to send transaction notification email: ${errorMessage}`,
      };
    }
  }

  /**
   * Gets the name of the currently configured email provider
   * 
   * @returns {string} Provider name ('resend', 'smtp', or 'mailtrap')
   * 
   * @example
   * ```typescript
   * console.log(`Using provider: ${emailService.getProviderName()}`);
   * // Output: "Using provider: resend"
   * ```
   */
  getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Gets list of available locales for email templates
   * 
   * @returns {string[]} Array of available locale codes
   * 
   * @example
   * ```typescript
   * const locales = emailService.getAvailableLocales();
   * console.log('Supported languages:', locales); // ['en', 'es', 'fr']
   * ```
   */
  getAvailableLocales(): string[] {
    return this.templateService.getAvailableLocales();
  }
}