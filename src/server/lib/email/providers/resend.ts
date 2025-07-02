import { Resend } from 'resend';
import { EmailProvider, EmailProviderConfig, EmailSendResponse, SendEmailOptions } from './types';

/**
 * Resend email provider implementation
 * 
 * Resend is a modern email API designed for developers. It offers:
 * - 3,000 emails/month free tier
 * - Excellent TypeScript support
 * - High deliverability rates
 * - Simple, developer-friendly API
 * 
 * @see https://resend.com/
 */
export class ResendProvider implements EmailProvider {
  public readonly name = 'resend';
  private client: Resend;
  private config: EmailProviderConfig;

  /**
   * Initialize Resend provider with API key
   * 
   * @param config - Email provider configuration containing Resend API key
   * @throws {Error} When Resend API key is missing
   * 
   * @example
   * ```typescript
   * const provider = new ResendProvider({
   *   apiKey: 're_your_api_key',
   *   from: { email: 'noreply@yourdomain.com', name: 'Your App' }
   * });
   * ```
   */
  constructor(config: EmailProviderConfig) {
    this.config = config;
    
    if (!this.config.apiKey) {
      throw new Error('Resend API key is required');
    }

    this.client = new Resend(this.config.apiKey);
  }

  /**
   * Validates the Resend provider configuration
   * 
   * @returns {boolean} True if API key and from email are present, false otherwise
   */
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.from?.email);
  }

  /**
   * Sends an email through Resend API
   * 
   * @param options - Email sending options including recipients, content, attachments, etc.
   * @returns {Promise<EmailSendResponse>} Response indicating success/failure with Resend message ID
   * 
   * @example
   * ```typescript
   * const response = await resendProvider.sendEmail({
   *   to: { email: 'user@example.com', name: 'John Doe' },
   *   from: { email: 'noreply@yourdomain.com', name: 'Your App' },
   *   subject: 'Welcome to our service!',
   *   html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
   *   text: 'Welcome! Thanks for signing up.',
   *   tags: { type: 'welcome', user_type: 'new' }
   * });
   * 
   * if (response.success) {
   *   console.log('Email sent with ID:', response.id);
   * } else {
   *   console.error('Email failed:', response.error);
   * }
   * ```
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailSendResponse> {
    try {
      if (!this.validateConfig()) {
        throw new Error('Invalid Resend configuration');
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

      const result = await this.client.emails.send({
        from: fromAddress,
        to: normalizedTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: replyToAddress,
        tags: options.tags ? Object.entries(options.tags).map(([name, value]) => ({ name, value })) : undefined,
        headers: options.headers,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      if (result.error) {
        return {
          id: '',
          success: false,
          error: result.error.message || 'Failed to send email via Resend',
        };
      }

      return {
        id: result.data?.id || '',
        success: true,
        message: 'Email sent successfully via Resend',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        id: '',
        success: false,
        error: `Failed to send email via Resend: ${errorMessage}`,
      };
    }
  }
}