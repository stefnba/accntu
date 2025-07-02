import { ResendProvider } from '../providers/resend';
import { SMTPProvider } from '../providers/smtp';
import { MailtrapProvider } from '../providers/mailtrap';
import { EmailTemplateEngine } from './template-engine';
import { 
  EmailTemplate,
  TemplateEmailData,
  templateRegistry,
  TemplateId,
  TemplateDataMap
} from './template-registry';
import { 
  EmailProvider, 
  EmailProviderConfig, 
  EmailProviderType, 
  EmailSendResponse, 
  SendEmailOptions,
  EmailAddress 
} from '../providers/types';

/**
 * Configuration for the decentralized EmailService
 */
export interface EmailServiceConfig {
  /** Email provider to use */
  provider: EmailProviderType;
  /** Resend configuration */
  resend?: { apiKey: string };
  /** SMTP configuration */
  smtp?: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    secure?: boolean;
  };
  /** Mailtrap configuration */
  mailtrap?: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  /** Default sender address */
  from: EmailAddress;
  /** Default reply-to address */
  replyTo?: EmailAddress;
  /** Template engine options */
  templateEngine?: {
    rootDir?: string;
    locales?: string[];
    localesDir?: string;
    cssPath?: string;
    enableCache?: boolean;
  };
}

/**
 * Decentralized email service with template registry support
 * 
 * This service uses a template registry system where templates are defined
 * in their respective feature folders and registered with the central system.
 * This provides type-safe template selection and decentralized template management.
 * 
 * @example
 * ```typescript
 * // Send type-safe templated email
 * await emailService.sendEmail('auth.otp', {
 *   to: { email: 'user@example.com', name: 'John' },
 *   data: {
 *     user: { name: 'John', email: 'user@example.com' },
 *     otpCode: '123456'
 *   },
 *   locale: 'en'
 * });
 * ```
 */
export class EmailService {
  private provider: EmailProvider;
  private templateEngine: EmailTemplateEngine;
  private config: EmailServiceConfig;

  /**
   * Initialize the email service
   * 
   * @param config - Email service configuration
   */
  constructor(config: EmailServiceConfig) {
    this.config = config;
    this.templateEngine = new EmailTemplateEngine(config.templateEngine);
    this.provider = this.createProvider(config);

    if (!this.provider.validateConfig()) {
      throw new Error(`Invalid configuration for ${config.provider} email provider`);
    }
  }

  /**
   * Sends a templated email with type safety
   * 
   * @param templateId - The registered template ID
   * @param emailData - Email data including recipient and template data
   * @returns Response indicating success/failure
   * 
   * @example
   * ```typescript
   * // Type-safe OTP email
   * await emailService.sendEmail('auth.otp', {
   *   to: { email: 'user@example.com', name: 'John Doe' },
   *   data: {
   *     user: { name: 'John Doe', email: 'user@example.com' },
   *     otpCode: '123456'
   *   },
   *   locale: 'en',
   *   tags: { type: 'authentication' }
   * });
   * 
   * // Type-safe transaction notification
   * await emailService.sendEmail('transaction.notification', {
   *   to: { email: 'user@example.com' },
   *   data: {
   *     user: { name: 'Alice', email: 'user@example.com' },
   *     transaction: {
   *       amount: -29.99,
   *       description: 'Coffee Shop',
   *       date: '2025-07-02'
   *     }
   *   }
   * });
   * ```
   */
  async sendEmail<T extends TemplateId>(
    templateId: T,
    emailData: TemplateEmailData<TemplateDataMap[T]>
  ): Promise<EmailSendResponse>;
  
  /**
   * Sends a templated email with dynamic template ID (less type-safe)
   * 
   * @param templateId - The template ID as string
   * @param emailData - Email data
   */
  async sendEmail(
    templateId: string,
    emailData: TemplateEmailData<any>
  ): Promise<EmailSendResponse>;
  
  async sendEmail<T extends TemplateId>(
    templateId: T | string,
    emailData: TemplateEmailData<any>
  ): Promise<EmailSendResponse> {
    try {
      // Get template configuration
      const template = templateRegistry.get(templateId as string);
      
      // Use template's default locale if not specified
      const locale = emailData.locale || template.defaultLocale || 'en';
      
      // Render template
      const content = await this.templateEngine.renderTemplate(
        templateId as string,
        emailData.data,
        locale
      );

      // Prepare email options
      const emailOptions: SendEmailOptions = {
        to: emailData.to,
        from: emailData.from || this.config.from,
        replyTo: emailData.replyTo || this.config.replyTo,
        subject: content.subject,
        html: content.html,
        text: content.text,
        tags: {
          template: templateId as string,
          category: template.category,
          locale,
          ...emailData.tags,
        },
        headers: emailData.headers,
      };

      // Send email
      return await this.provider.sendEmail(emailOptions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        id: '',
        success: false,
        error: `Failed to send templated email '${templateId}': ${errorMessage}`,
      };
    }
  }

  /**
   * Sends a raw email (without templates)
   * 
   * @param options - Raw email options
   */
  async sendRawEmail(options: Omit<SendEmailOptions, 'from'> & { from?: EmailAddress }): Promise<EmailSendResponse> {
    const emailOptions: SendEmailOptions = {
      ...options,
      from: options.from || this.config.from,
    };

    if (this.config.replyTo && !emailOptions.replyTo) {
      emailOptions.replyTo = this.config.replyTo;
    }

    return this.provider.sendEmail(emailOptions);
  }

  /**
   * Previews a template without sending (useful for development/testing)
   * 
   * @param templateId - The template ID
   * @param data - Template data
   * @param locale - Locale for rendering
   * @returns Rendered email content
   */
  async previewTemplate<T extends TemplateId>(
    templateId: T,
    data: TemplateDataMap[T],
    locale = 'en'
  ): Promise<{ html: string; text: string; subject: string; template: EmailTemplate<any> }> {
    const template = templateRegistry.get(templateId as string);
    const content = await this.templateEngine.renderTemplate(templateId as string, data, locale);
    
    return {
      ...content,
      template,
    };
  }

  /**
   * Gets information about a registered template
   * 
   * @param templateId - The template ID
   */
  getTemplateInfo(templateId: string): EmailTemplate<any> {
    return templateRegistry.get(templateId);
  }

  /**
   * Gets all available templates
   */
  getAvailableTemplates(): EmailTemplate<any>[] {
    return templateRegistry.getAll();
  }

  /**
   * Gets templates by category
   * 
   * @param category - The template category
   */
  getTemplatesByCategory(category: string): EmailTemplate<any>[] {
    return templateRegistry.getByCategory(category);
  }

  /**
   * Gets the current email provider name
   */
  getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Gets available locales for templates
   */
  getAvailableLocales(): string[] {
    return this.templateEngine.getAvailableLocales();
  }

  /**
   * Precompiles all registered templates for production performance
   */
  precompileTemplates(): void {
    this.templateEngine.precompileTemplates();
  }

  /**
   * Gets template cache statistics (for monitoring)
   */
  getTemplateStats(): { 
    registeredTemplates: number; 
    availableTemplates: string[];
    cacheStats: { size: number; templates: string[] };
  } {
    return {
      registeredTemplates: templateRegistry.getAvailableTemplateIds().length,
      availableTemplates: templateRegistry.getAvailableTemplateIds(),
      cacheStats: this.templateEngine.getCacheStats(),
    };
  }

  /**
   * Creates the email provider based on configuration
   * 
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
}