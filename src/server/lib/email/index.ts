/**
 * Decentralized email service with template registry
 * 
 * This module provides a type-safe, decentralized email system where:
 * - Templates are defined in their respective feature folders
 * - Type safety is enforced based on template selection
 * - Configuration-based provider switching (Resend, Mailtrap, SMTP)
 * - Jinja2-style templating with internationalization
 */

// Core exports
export { EmailService } from './core/email-service';
export { EmailTemplateEngine } from './core/template-engine';
export { EmailTemplateRegistry, templateRegistry } from './core/template-registry';

// Provider exports
export { ResendProvider } from './providers/resend';
export { SMTPProvider } from './providers/smtp';
export { MailtrapProvider } from './providers/mailtrap';

// Type exports
export type { EmailServiceConfig } from './core/email-service';
export type { EmailTemplate, TemplateEmailData, TemplateId, TemplateDataMap } from './core/template-registry';
export type * from './providers/types';
export type * from './types';

// Register all feature templates
import { registerAuthEmailTemplates } from '@/features/auth/email/templates';
import { registerTransactionEmailTemplates } from '@/features/transaction/email/templates';
import { EmailService, type EmailServiceConfig } from './core/email-service';

/**
 * Registers all email templates from all features
 * 
 * This function should be called once during application startup
 * to register all available email templates.
 */
export function registerAllEmailTemplates(): void {
  registerAuthEmailTemplates();
  registerTransactionEmailTemplates();
}

/**
 * Creates an EmailService instance from environment variables
 * 
 * @returns {EmailService} Configured email service instance
 * @throws {Error} When required environment variables are missing
 * 
 * @example
 * ```typescript
 * // Ensure templates are registered first
 * registerAllEmailTemplates();
 * 
 * // Create service from environment
 * const emailService = createEmailServiceFromEnv();
 * 
 * // Send type-safe emails
 * await emailService.sendEmail('auth.otp', {
 *   to: { email: 'user@example.com', name: 'John' },
 *   data: {
 *     user: { name: 'John', email: 'user@example.com' },
 *     otpCode: '123456'
 *   }
 * });
 * ```
 */
export function createEmailServiceFromEnv(): EmailService {
  const provider = (process.env.EMAIL_PROVIDER as 'resend' | 'smtp' | 'mailtrap') || 'resend';
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || 'Accntu';

  if (!fromEmail) {
    throw new Error('EMAIL_FROM or SMTP_FROM environment variable is required');
  }

  const config: EmailServiceConfig = {
    provider,
    from: {
      email: fromEmail,
      name: fromName,
    },
    replyTo: process.env.EMAIL_REPLY_TO ? {
      email: process.env.EMAIL_REPLY_TO,
      name: process.env.EMAIL_REPLY_TO_NAME,
    } : undefined,
  };

  // Configure provider-specific settings
  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required for Resend provider');
    }
    config.resend = { apiKey };
  } else if (provider === 'smtp') {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    
    if (!host) {
      throw new Error('SMTP_HOST environment variable is required for SMTP provider');
    }

    config.smtp = {
      host,
      port,
      username: process.env.SMTP_USER,
      password: process.env.SMTP_PASS,
      secure: process.env.SMTP_SECURE === 'true',
    };
  } else if (provider === 'mailtrap') {
    const host = process.env.MAILTRAP_HOST;
    const port = parseInt(process.env.MAILTRAP_PORT || '2525', 10);
    const username = process.env.MAILTRAP_USER;
    const password = process.env.MAILTRAP_PASS;
    
    if (!host || !username || !password) {
      throw new Error('MAILTRAP_HOST, MAILTRAP_USER, and MAILTRAP_PASS environment variables are required for Mailtrap provider');
    }

    config.mailtrap = {
      host,
      port,
      username,
      password,
    };
  }

  return new EmailService(config);
}

/**
 * Auto-register templates and create service instance
 * 
 * This is a convenience function that registers all templates and creates
 * the email service in one step. Use this for quick setup.
 */
export function initializeEmailService(): EmailService {
  // Register all templates first
  registerAllEmailTemplates();
  
  // Create and return service
  return createEmailServiceFromEnv();
}

/**
 * Pre-configured email service instance
 * 
 * This instance is created with templates pre-registered and configured
 * from environment variables. Use this for immediate access to the email service.
 * 
 * @example
 * ```typescript
 * import { emailService } from '@/server/lib/email';
 * 
 * // Type-safe email sending
 * await emailService.sendEmail('auth.otp', {
 *   to: { email: 'user@example.com' },
 *   data: {
 *     user: { name: 'John', email: 'user@example.com' },
 *     otpCode: '123456'
 *   }
 * });
 * ```
 */
export const emailService = initializeEmailService();