import { EmailTemplate } from '@/server/lib/email/core/template-registry';
import { 
  OTPEmailData, 
  WelcomeEmailData, 
  PasswordResetEmailData,
  OTPEmailDataSchema,
  WelcomeEmailDataSchema,
  PasswordResetEmailDataSchema
} from './schemas';

/**
 * OTP verification email template configuration
 * 
 * Used for email verification during sign-in, sign-up, and password reset flows.
 */
export class OTPEmailTemplate implements EmailTemplate<OTPEmailData> {
  readonly id = 'auth.otp';
  readonly templatePath = 'src/features/auth/email/templates/otp.njk';
  readonly textTemplatePath = 'src/features/auth/email/templates/otp.txt';
  readonly schema = OTPEmailDataSchema;
  readonly subjectKey = 'auth.otp.subject';
  readonly defaultLocale = 'en';
  readonly category = 'authentication';
  readonly description = 'OTP verification email for secure authentication';
}

/**
 * Welcome email template configuration
 * 
 * Sent to new users after successful registration to welcome them
 * and provide getting started guidance.
 */
export class WelcomeEmailTemplate implements EmailTemplate<WelcomeEmailData> {
  readonly id = 'auth.welcome';
  readonly templatePath = 'src/features/auth/email/templates/welcome.njk';
  readonly textTemplatePath = 'src/features/auth/email/templates/welcome.txt';
  readonly schema = WelcomeEmailDataSchema;
  readonly subjectKey = 'auth.welcome.subject';
  readonly defaultLocale = 'en';
  readonly category = 'authentication';
  readonly description = 'Welcome email for new users with onboarding guidance';
}

/**
 * Password reset email template configuration
 * 
 * Sent when users request to reset their password, containing
 * a secure reset link with expiration information.
 */
export class PasswordResetEmailTemplate implements EmailTemplate<PasswordResetEmailData> {
  readonly id = 'auth.password-reset';
  readonly templatePath = 'src/features/auth/email/templates/password-reset.njk';
  readonly textTemplatePath = 'src/features/auth/email/templates/password-reset.txt';
  readonly schema = PasswordResetEmailDataSchema;
  readonly subjectKey = 'auth.password_reset.subject';
  readonly defaultLocale = 'en';
  readonly category = 'authentication';
  readonly description = 'Password reset email with secure reset link';
}

/**
 * Registers all authentication email templates
 * 
 * This function should be called during application startup to register
 * all authentication-related email templates with the global registry.
 * 
 * @example
 * ```typescript
 * import { registerAuthEmailTemplates } from '@/features/auth/email/templates';
 * 
 * // During app initialization
 * registerAuthEmailTemplates();
 * ```
 */
export function registerAuthEmailTemplates(): void {
  // Import dynamically to avoid circular dependencies
  import('@/server/lib/email/core/template-registry').then(({ templateRegistry }) => {
    templateRegistry.register(new OTPEmailTemplate());
    templateRegistry.register(new WelcomeEmailTemplate());
    templateRegistry.register(new PasswordResetEmailTemplate());
  });
}

/**
 * Export template instances for direct access if needed
 */
export const authEmailTemplates = {
  otp: new OTPEmailTemplate(),
  welcome: new WelcomeEmailTemplate(),
  passwordReset: new PasswordResetEmailTemplate(),
} as const;