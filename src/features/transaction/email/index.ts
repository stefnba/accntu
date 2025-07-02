/**
 * Transaction Email Module
 * 
 * Exports all transaction-related email functionality including
 * configurations, schemas, and type-safe sender functions.
 */

export {
    transactionNotificationConfig,
    monthlySummaryConfig,
    sendTransactionNotificationEmail,
    sendMonthlySummaryEmail,
} from './templates';

export {
    TransactionNotificationEmailDataSchema,
    MonthlySummaryEmailDataSchema,
    type TransactionNotificationEmailData,
    type MonthlySummaryEmailData,
} from './schemas';