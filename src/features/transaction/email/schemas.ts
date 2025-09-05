import { z } from 'zod';

/**
 * Schema for transaction notification email data
 */
export const TransactionNotificationEmailDataSchema = z.object({
    user: z.object({
        name: z.string().min(1, 'User name is required'),
        email: z.email('Invalid email address'),
    }),
    transaction: z.object({
        amount: z.number(),
        description: z.string().min(1, 'Transaction description is required'),
        date: z.string(),
        category: z.string().optional(),
        account: z.string().optional(),
    }),
});

/**
 * Schema for monthly summary email data
 */
export const MonthlySummaryEmailDataSchema = z.object({
    user: z.object({
        name: z.string().min(1, 'User name is required'),
        email: z.email('Invalid email address'),
    }),
    summary: z.object({
        month: z.string(),
        year: z.number(),
        totalIncome: z.number(),
        totalExpenses: z.number(),
        netAmount: z.number(),
        topCategories: z
            .array(
                z.object({
                    category: z.string(),
                    amount: z.number(),
                    percentage: z.number(),
                })
            )
            .optional(),
        transactionCount: z.number(),
    }),
});

/**
 * Type exports for use in template configurations
 */
export type TransactionNotificationEmailData = z.infer<
    typeof TransactionNotificationEmailDataSchema
>;
export type MonthlySummaryEmailData = z.infer<typeof MonthlySummaryEmailDataSchema>;
