import * as nodemailer from 'nodemailer';
import { EmailProvider, EmailProviderConfig, EmailSendResponse, SendEmailOptions } from './types';

/**
 * Generic SMTP email provider implementation
 * 
 * Supports any SMTP server including:
 * - Gmail SMTP
 * - Outlook/Hotmail SMTP
 * - Custom SMTP servers
 * - Corporate email servers
 * 
 * This provider serves as a fallback option when dedicated email services
 * like Resend are not available or preferred.
 */
export class SMTPProvider implements EmailProvider {
  public readonly name = 'smtp';
  private transporter: nodemailer.Transporter;
  private config: EmailProviderConfig;

  /**
   * Initialize SMTP provider with server configuration
   * 
   * @param config - Email provider configuration containing SMTP settings
   * @throws {Error} When required SMTP host or port is missing
   * 
   * @example
   * ```typescript
   * // Gmail SMTP configuration
   * const provider = new SMTPProvider({
   *   host: 'smtp.gmail.com',
   *   port: 587,
   *   secure: false,
   *   username: 'your-email@gmail.com',
   *   password: 'your-app-password',
   *   from: { email: 'noreply@yourdomain.com', name: 'Your App' }
   * });
   * 
   * // Custom SMTP server
   * const customProvider = new SMTPProvider({
   *   host: 'mail.yourdomain.com',
   *   port: 465,
   *   secure: true,
   *   username: 'noreply@yourdomain.com',
   *   password: 'your-password',
   *   from: { email: 'noreply@yourdomain.com', name: 'Your App' }
   * });
   * ```
   */
  constructor(config: EmailProviderConfig) {
    this.config = config;
    
    if (!this.config.host || !this.config.port) {
      throw new Error('SMTP host and port are required');
    }

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure ?? (this.config.port === 465),
      auth: this.config.username && this.config.password ? {
        user: this.config.username,
        pass: this.config.password,
      } : undefined,
    });
  }

  /**
   * Validates the SMTP provider configuration
   * 
   * Checks that required fields are present:
   * - Host and port are specified
   * - From email address is configured
   * - If username is provided, password must also be provided
   * 
   * @returns {boolean} True if configuration is valid, false otherwise
   */
  validateConfig(): boolean {
    return !!(
      this.config.host && 
      this.config.port && 
      this.config.from?.email &&
      (!this.config.username || this.config.password)
    );
  }

  /**
   * Sends an email through the configured SMTP server
   * 
   * @param options - Email sending options including recipients, content, attachments, etc.
   * @returns {Promise<EmailSendResponse>} Response indicating success/failure with message ID
   * 
   * @example
   * ```typescript
   * const response = await smtpProvider.sendEmail({
   *   to: { email: 'user@example.com', name: 'John Doe' },
   *   from: { email: 'noreply@yourdomain.com', name: 'Your App' },
   *   subject: 'Welcome to our service!',
   *   html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
   *   text: 'Welcome! Thanks for signing up.',
   *   attachments: [{
   *     filename: 'welcome.pdf',
   *     content: pdfBuffer,
   *     contentType: 'application/pdf'
   *   }]
   * });
   * 
   * if (response.success) {
   *   console.log('Email sent via SMTP:', response.id);
   * } else {
   *   console.error('SMTP send failed:', response.error);
   * }
   * ```
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailSendResponse> {
    try {
      if (!this.validateConfig()) {
        throw new Error('Invalid SMTP configuration');
      }

      const normalizedTo = Array.isArray(options.to) 
        ? options.to.map(addr => addr.name ? `${addr.name} <${addr.email}>` : addr.email)
        : [options.to.name ? `${options.to.name} <${options.to.email}>` : options.to.email];

      const fromAddress = options.from.name 
        ? `${options.from.name} <${options.from.email}>`
        : options.from.email;

      const replyToAddress = options.replyTo
        ? options.replyTo.name ? `${options.replyTo.name} <${options.replyTo.email}>` : options.replyTo.email
        : undefined;

      const result = await this.transporter.sendMail({
        from: fromAddress,
        to: normalizedTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: replyToAddress,
        headers: options.headers,
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
        message: 'Email sent successfully via SMTP',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        id: '',
        success: false,
        error: `Failed to send email via SMTP: ${errorMessage}`,
      };
    }
  }
}