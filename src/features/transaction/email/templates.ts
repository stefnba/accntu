import { emailService } from '@/server/lib/email';
import { createEmailConfig } from '@/server/lib/email/core';
import { MonthlySummaryEmailDataSchema, TransactionNotificationEmailDataSchema } from './schemas';

/**
 * Transaction notification email configuration
 */
export const transactionNotificationConfig = createEmailConfig({
    id: 'transaction-notification',
    templatePath: 'features/transaction/email/templates/notification.njk',
    subjectKey: 'transaction.notification.subject',
    schema: TransactionNotificationEmailDataSchema,
    category: 'notifications',
    description: 'Real-time notification for new transactions',
});

/**
 * Monthly summary email configuration
 */
export const monthlySummaryConfig = createEmailConfig({
    id: 'transaction-monthly-summary',
    templatePath: 'features/transaction/email/templates/monthly-summary.njk',
    subjectKey: 'transaction.monthly_summary.subject',
    schema: MonthlySummaryEmailDataSchema,
    category: 'notifications',
    description: 'Monthly financial summary with insights and trends',
});

/**
 * Type-safe sender functions
 */
export const sendTransactionNotificationEmail = emailService.createSender(
    transactionNotificationConfig
);
export const sendMonthlySummaryEmail = emailService.createSender(monthlySummaryConfig);
