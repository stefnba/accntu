import { EmailTemplate } from '@/server/lib/email/core/template-registry';
import { 
  TransactionNotificationEmailData, 
  MonthlySummaryEmailData,
  TransactionNotificationEmailDataSchema,
  MonthlySummaryEmailDataSchema
} from './schemas';

/**
 * Transaction notification email template configuration
 * 
 * Sent when a new transaction is recorded, providing users with
 * immediate notification of financial activity on their accounts.
 */
export class TransactionNotificationEmailTemplate implements EmailTemplate<TransactionNotificationEmailData> {
  readonly id = 'transaction.notification';
  readonly templatePath = 'src/features/transaction/email/templates/notification.njk';
  readonly textTemplatePath = 'src/features/transaction/email/templates/notification.txt';
  readonly schema = TransactionNotificationEmailDataSchema;
  readonly subjectKey = 'transaction.notification.subject';
  readonly defaultLocale = 'en';
  readonly category = 'transaction';
  readonly description = 'Real-time notification for new transactions';
}

/**
 * Monthly summary email template configuration
 * 
 * Sent at the end of each month to provide users with a comprehensive
 * overview of their financial activity, including income, expenses, and trends.
 */
export class MonthlySummaryEmailTemplate implements EmailTemplate<MonthlySummaryEmailData> {
  readonly id = 'transaction.monthly-summary';
  readonly templatePath = 'src/features/transaction/email/templates/monthly-summary.njk';
  readonly textTemplatePath = 'src/features/transaction/email/templates/monthly-summary.txt';
  readonly schema = MonthlySummaryEmailDataSchema;
  readonly subjectKey = 'transaction.monthly_summary.subject';
  readonly defaultLocale = 'en';
  readonly category = 'transaction';
  readonly description = 'Monthly financial summary with insights and trends';
}

/**
 * Registers all transaction email templates
 * 
 * This function should be called during application startup to register
 * all transaction-related email templates with the global registry.
 * 
 * @example
 * ```typescript
 * import { registerTransactionEmailTemplates } from '@/features/transaction/email/templates';
 * 
 * // During app initialization
 * registerTransactionEmailTemplates();
 * ```
 */
export function registerTransactionEmailTemplates(): void {
  // Import dynamically to avoid circular dependencies
  import('@/server/lib/email/core/template-registry').then(({ templateRegistry }) => {
    templateRegistry.register(new TransactionNotificationEmailTemplate());
    templateRegistry.register(new MonthlySummaryEmailTemplate());
  });
}

/**
 * Export template instances for direct access if needed
 */
export const transactionEmailTemplates = {
  notification: new TransactionNotificationEmailTemplate(),
  monthlySummary: new MonthlySummaryEmailTemplate(),
} as const;