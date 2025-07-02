import { emailService } from '@/server/lib/email';
import { otpEmailConfig, welcomeEmailConfig } from './mails';

/**
 * ## Auth Email Senders
 *
 * This file creates and exports strongly-typed sender functions for all
 * authentication-related emails. Using these senders is the recommended
 * way to send emails as it provides full type-safety.
 *
 * @example
 * ```typescript
 * import { sendWelcomeEmail } from '@/features/auth/email';
 *
 * await sendWelcomeEmail({
 *   to: { email: 'new.user@example.com' },
 *   data: {
 *     user: { name: 'Stefan', email: 'new.user@example.com' }
 *   }
 * });
 * ```
 */

/**
 * Sends a welcome email to a new user.
 * @see WelcomeEmail for data schema.
 */
export const sendWelcomeEmail = emailService.createSender(welcomeEmailConfig);

/**
 * Sends a one-time password (OTP) email for verification.
 * @see OtpEmail for data schema.
 */
export const sendOtpEmail = emailService.createSender(otpEmailConfig);
