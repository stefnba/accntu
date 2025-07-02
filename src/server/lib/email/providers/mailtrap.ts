import * as nodemailer from 'nodemailer';
import { EmailProvider, EmailProviderConfig, EmailSendResponse, SendEmailOptions } from './types';

/**
 * Mailtrap email provider for development and testing
 * 
 * Mailtrap is a fake SMTP service that captures emails in a virtual inbox
 * instead of delivering them to real recipients. Perfect for development,
 * staging, and testing environments.
 * 
 * @see https://mailtrap.io/
 */
export class MailtrapProvider implements EmailProvider {
  public readonly name = 'mailtrap';
  private transporter: nodemailer.Transporter;
  private config: EmailProviderConfig;

  /**
   * Initialize Mailtrap provider
   * 
   * @param config - Email provider configuration containing Mailtrap credentials
   * @throws {Error} When required Mailtrap configuration is missing
   */
  constructor(config: EmailProviderConfig) {
    this.config = config;
    
    if (!this.config.host || !this.config.port || !this.config.username || !this.config.password) {
      throw new Error('Mailtrap host, port, username, and password are required');
    }

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: false, // Mailtrap typically uses port 587 (not secure)
      auth: {
        user: this.config.username,
        pass: this.config.password,
      },
      // Mailtrap-specific settings
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5,
    });
  }

  /**
   * Validates the Mailtrap provider configuration
   * 
   * @returns {boolean} True if configuration is valid, false otherwise
   */
  validateConfig(): boolean {
    return !!(
      this.config.host && 
      this.config.port && 
      this.config.username && 
      this.config.password &&
      this.config.from?.email
    );
  }

  /**
   * Sends an email through Mailtrap (captured in virtual inbox)
   * 
   * @param options - Email sending options including recipients, content, etc.
   * @returns {Promise<EmailSendResponse>} Response indicating success/failure with message ID
   * 
   * @example
   * ```typescript
   * const response = await mailtrapProvider.sendEmail({
   *   to: { email: 'test@example.com', name: 'Test User' },
   *   from: { email: 'noreply@accntu.com', name: 'Accntu' },
   *   subject: 'Test Email',
   *   html: '<h1>Hello World</h1>',
   *   text: 'Hello World'
   * });
   * 
   * if (response.success) {
   *   console.log('Email captured in Mailtrap:', response.id);
   * }
   * ```
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailSendResponse> {
    try {
      if (!this.validateConfig()) {
        throw new Error('Invalid Mailtrap configuration');
      }

      // Normalize recipients to string format
      const normalizedTo = Array.isArray(options.to) 
        ? options.to.map(addr => addr.name ? `${addr.name} <${addr.email}>` : addr.email)
        : [options.to.name ? `${options.to.name} <${options.to.email}>` : options.to.email];

      // Format sender address
      const fromAddress = options.from.name 
        ? `${options.from.name} <${options.from.email}>`
        : options.from.email;

      // Format reply-to address if provided
      const replyToAddress = options.replyTo
        ? options.replyTo.name ? `${options.replyTo.name} <${options.replyTo.email}>` : options.replyTo.email
        : undefined;

      // Send email through Mailtrap
      const result = await this.transporter.sendMail({
        from: fromAddress,
        to: normalizedTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: replyToAddress,
        headers: {
          ...options.headers,
          // Add Mailtrap-specific headers for better debugging
          'X-Mailtrap-Category': options.tags?.type || 'general',
          'X-Mailtrap-Environment': process.env.NODE_ENV || 'development',
        },
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          encoding: att.encoding,
        })),
      });

      return {
        id: result.messageId || '',
        success: true,
        message: `Email captured in Mailtrap inbox (${this.config.host})`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        id: '',
        success: false,
        error: `Failed to send email via Mailtrap: ${errorMessage}`,
      };
    }
  }

  /**
   * Gets the Mailtrap inbox URL for viewing captured emails
   * 
   * @returns {string} URL to access Mailtrap inbox (if host is recognized Mailtrap domain)
   */
  getInboxUrl(): string {
    if (this.config.host?.includes('mailtrap.io')) {
      return 'https://mailtrap.io/inboxes';
    }
    return 'Check your Mailtrap dashboard for captured emails';
  }

  /**
   * Verifies connection to Mailtrap server
   * 
   * @returns {Promise<boolean>} True if connection successful, false otherwise
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Mailtrap connection verification failed:', error);
      return false;
    }
  }
}