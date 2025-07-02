/**
 * Type augmentations for the email template system
 * 
 * This file extends the core TemplateDataMap interface to provide
 * type safety for all registered email templates.
 */

// Import template data types from features
import type { OTPEmailData, WelcomeEmailData, PasswordResetEmailData } from '@/features/auth/email/schemas';
import type { TransactionNotificationEmailData, MonthlySummaryEmailData } from '@/features/transaction/email/schemas';

// Augment the TemplateDataMap interface
declare module '@/server/lib/email/core/template-registry' {
  interface TemplateDataMap {
    // Authentication templates
    'auth.otp': OTPEmailData;
    'auth.welcome': WelcomeEmailData;
    'auth.password-reset': PasswordResetEmailData;
    
    // Transaction templates
    'transaction.notification': TransactionNotificationEmailData;
    'transaction.monthly-summary': MonthlySummaryEmailData;
  }
}

/**
 * Convenience type exports for external use
 */
export type { 
  OTPEmailData, 
  WelcomeEmailData, 
  PasswordResetEmailData,
  TransactionNotificationEmailData,
  MonthlySummaryEmailData
};

/**
 * Union type of all available template IDs for type checking
 */
export type AvailableTemplateIds = 
  | 'auth.otp'
  | 'auth.welcome' 
  | 'auth.password-reset'
  | 'transaction.notification'
  | 'transaction.monthly-summary';

/**
 * Helper type to get template data type from template ID
 */
export type GetTemplateData<T extends AvailableTemplateIds> = 
  T extends 'auth.otp' ? OTPEmailData :
  T extends 'auth.welcome' ? WelcomeEmailData :
  T extends 'auth.password-reset' ? PasswordResetEmailData :
  T extends 'transaction.notification' ? TransactionNotificationEmailData :
  T extends 'transaction.monthly-summary' ? MonthlySummaryEmailData :
  never;