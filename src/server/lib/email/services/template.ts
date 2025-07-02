import * as nunjucks from 'nunjucks';
import * as juice from 'juice';
import { I18n } from 'i18n';
import { readFileSync } from 'fs';
import { join } from 'path';
import { EmailContent, EmailTemplate, TemplateData } from '../providers/types';

/**
 * Email template service using Nunjucks (Jinja2-style) templating
 * 
 * This service provides:
 * - Jinja2-identical template syntax via Nunjucks
 * - CSS inlining for email client compatibility
 * - Internationalization (i18n) support
 * - Template inheritance and layouts
 * - Automatic HTML to text conversion fallbacks
 * 
 * Templates are stored in the templates/ directory with .njk extension for HTML
 * and .txt extension for plain text versions.
 */
export class EmailTemplateService {
  private nunjucks: nunjucks.Environment;
  private i18n: I18n;
  private cssContent: string;
  private templatesPath: string;

  /**
   * Initialize the email template service
   * 
   * Sets up Nunjucks templating engine, i18n support, and CSS processing.
   * Templates are loaded from the templates/ directory relative to this service.
   * 
   * @example
   * ```typescript
   * const templateService = new EmailTemplateService();
   * 
   * const content = await templateService.renderOTPEmail(
   *   { name: 'John', email: 'john@example.com' },
   *   '123456',
   *   'en'
   * );
   * 
   * console.log(content.html); // Rendered HTML with CSS inlined
   * console.log(content.text); // Plain text version
   * console.log(content.subject); // Localized subject
   * ```
   */
  constructor() {
    this.templatesPath = join(__dirname, '..', 'templates');
    
    this.nunjucks = nunjucks.configure(this.templatesPath, {
      autoescape: true,
      trimBlocks: true,
      lstripBlocks: true,
      noCache: process.env.NODE_ENV === 'development',
    });

    this.i18n = new I18n({
      locales: ['en', 'es', 'fr'],
      directory: join(__dirname, '..', 'locales'),
      defaultLocale: 'en',
      updateFiles: false,
      syncFiles: false,
    });

    try {
      this.cssContent = readFileSync(join(__dirname, '..', 'styles', 'email.css'), 'utf8');
    } catch {
      this.cssContent = '';
    }
  }

  /**
   * Renders an email template with the provided data
   * 
   * @param template - Template configuration object
   * @param template.name - Template name/path (e.g., 'auth/otp', 'notifications/transaction')
   * @param template.subject - Subject line i18n key for localization
   * @param template.locale - Locale for internationalization (defaults to 'en')
   * @param template.data - Data object to pass to the template
   * @returns {Promise<EmailContent>} Rendered email content with HTML, text, and subject
   * 
   * @throws {Error} When template rendering fails or template file is not found
   * 
   * @example
   * ```typescript
   * const content = await templateService.renderTemplate({
   *   name: 'auth/welcome',
   *   subject: 'auth.welcome.subject',
   *   locale: 'en',
   *   data: {
   *     user: { name: 'John Doe', email: 'john@example.com' }
   *   }
   * });
   * 
   * // Returns:
   * // {
   * //   html: '<html>...rendered HTML with inlined CSS...</html>',
   * //   text: 'Plain text version of the email',
   * //   subject: 'Welcome to Accntu!'
   * // }
   * ```
   */
  async renderTemplate({ name, subject, locale = 'en', data }: EmailTemplate): Promise<EmailContent> {
    try {
      this.i18n.setLocale(locale);
      
      const templateData = {
        ...data,
        __: this.i18n.__.bind(this.i18n),
        locale,
        appName: 'Accntu',
        logoUrl: process.env.LOGO_URL || '',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@accntu.com',
      };

      const htmlContent = this.nunjucks.render(`${name}.njk`, templateData);
      
      const htmlWithInlinedCSS = this.cssContent 
        ? juice.inlineContent(htmlContent, this.cssContent, {
            removeStyleTags: false,
            preserveMediaQueries: true,
            webResources: {
              images: false,
              svgs: false,
              scripts: false,
              links: false,
            },
          })
        : htmlContent;

      let textContent: string;
      try {
        textContent = this.nunjucks.render(`${name}.txt`, templateData);
      } catch {
        textContent = this.htmlToText(htmlContent);
      }

      const renderedSubject = this.i18n.__(subject);

      return {
        html: htmlWithInlinedCSS,
        text: textContent,
        subject: renderedSubject,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown template error';
      throw new Error(`Failed to render email template '${name}': ${errorMessage}`);
    }
  }

  /**
   * Renders an OTP (One-Time Password) verification email
   * 
   * @param user - User object containing name and email
   * @param user.name - User's display name
   * @param user.email - User's email address
   * @param otpCode - The OTP code to include in the email
   * @param locale - Locale for internationalization (defaults to 'en')
   * @returns {Promise<EmailContent>} Rendered OTP email content
   * 
   * @example
   * ```typescript
   * const content = await templateService.renderOTPEmail(
   *   { name: 'John Doe', email: 'john@example.com' },
   *   '123456',
   *   'en'
   * );
   * 
   * // Email will contain the OTP code prominently displayed
   * // with expiration information and support contact details
   * ```
   */
  async renderOTPEmail(
    user: { name: string; email: string }, 
    otpCode: string, 
    locale = 'en'
  ): Promise<EmailContent> {
    return this.renderTemplate({
      name: 'auth/otp',
      subject: 'auth.otp.subject',
      locale,
      data: {
        user,
        otpCode,
        expirationMinutes: 10,
      },
    });
  }

  /**
   * Renders a welcome email for new users
   * 
   * @param user - User object containing name and email
   * @param user.name - User's display name
   * @param user.email - User's email address
   * @param locale - Locale for internationalization (defaults to 'en')
   * @returns {Promise<EmailContent>} Rendered welcome email content
   * 
   * @example
   * ```typescript
   * const content = await templateService.renderWelcomeEmail(
   *   { name: 'Jane Smith', email: 'jane@example.com' },
   *   'en'
   * );
   * 
   * // Email will contain welcome message, getting started guide,
   * // and call-to-action buttons for user onboarding
   * ```
   */
  async renderWelcomeEmail(
    user: { name: string; email: string }, 
    locale = 'en'
  ): Promise<EmailContent> {
    return this.renderTemplate({
      name: 'auth/welcome',
      subject: 'auth.welcome.subject',
      locale,
      data: { user },
    });
  }

  /**
   * Renders a password reset email with secure reset link
   * 
   * @param user - User object containing name and email
   * @param user.name - User's display name
   * @param user.email - User's email address
   * @param resetLink - Secure password reset URL
   * @param locale - Locale for internationalization (defaults to 'en')
   * @returns {Promise<EmailContent>} Rendered password reset email content
   * 
   * @example
   * ```typescript
   * const resetUrl = 'https://app.accntu.com/reset-password?token=abc123';
   * const content = await templateService.renderPasswordResetEmail(
   *   { name: 'John Doe', email: 'john@example.com' },
   *   resetUrl,
   *   'en'
   * );
   * 
   * // Email will contain secure reset link with expiration warning
   * // and security advice for the user
   * ```
   */
  async renderPasswordResetEmail(
    user: { name: string; email: string }, 
    resetLink: string, 
    locale = 'en'
  ): Promise<EmailContent> {
    return this.renderTemplate({
      name: 'auth/password-reset',
      subject: 'auth.password_reset.subject',
      locale,
      data: {
        user,
        resetLink,
        expirationHours: 1,
      },
    });
  }

  /**
   * Renders a transaction notification email
   * 
   * @param user - User object containing name and email
   * @param user.name - User's display name
   * @param user.email - User's email address
   * @param transaction - Transaction details to include in notification
   * @param transaction.amount - Transaction amount (positive for income, negative for expense)
   * @param transaction.description - Description of the transaction
   * @param transaction.date - Transaction date as formatted string
   * @param locale - Locale for internationalization (defaults to 'en')
   * @returns {Promise<EmailContent>} Rendered transaction notification email content
   * 
   * @example
   * ```typescript
   * const content = await templateService.renderTransactionNotificationEmail(
   *   { name: 'Alice Johnson', email: 'alice@example.com' },
   *   {
   *     amount: -89.99,
   *     description: 'Grocery shopping at Whole Foods',
   *     date: '2025-07-02'
   *   },
   *   'en'
   * );
   * 
   * // Email will show transaction details with proper formatting
   * // and links to view full transaction details
   * ```
   */
  async renderTransactionNotificationEmail(
    user: { name: string; email: string },
    transaction: { amount: number; description: string; date: string },
    locale = 'en'
  ): Promise<EmailContent> {
    return this.renderTemplate({
      name: 'notifications/transaction',
      subject: 'notifications.transaction.subject',
      locale,
      data: {
        user,
        transaction,
      },
    });
  }

  /**
   * Converts HTML content to plain text as fallback
   * 
   * Strips HTML tags and converts common HTML entities to text.
   * Used when a .txt template file is not available.
   * 
   * @param html - HTML content to convert
   * @returns {string} Plain text version of the HTML
   * @private
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Gets list of available locales for internationalization
   * 
   * @returns {string[]} Array of available locale codes (e.g., ['en', 'es', 'fr'])
   * 
   * @example
   * ```typescript
   * const locales = templateService.getAvailableLocales();
   * console.log(locales); // ['en', 'es', 'fr']
   * 
   * // Use to validate locale parameter or show language options to users
   * if (!locales.includes(userLocale)) {
   *   userLocale = 'en'; // fallback to English
   * }
   * ```
   */
  getAvailableLocales(): string[] {
    return this.i18n.getLocales();
  }

  /**
   * Precompiles templates for production performance
   * 
   * In production environments, templates are precompiled for faster rendering.
   * This method should be called during application startup.
   * 
   * @example
   * ```typescript
   * if (process.env.NODE_ENV === 'production') {
   *   templateService.precompileTemplates();
   * }
   * ```
   */
  precompileTemplates(): void {
    if (process.env.NODE_ENV === 'production') {
      nunjucks.precompile(this.templatesPath);
    }
  }
}