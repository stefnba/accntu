import {
    insertTransactionSchema,
    selectTransactionSchema,
    updateTransactionSchema,
} from '@/features/transaction/server/db/schema';
import { z } from 'zod';

// ====================
// Query Layer
// ====================

const amountTransformSchema = z.number().transform((val) => val.toString());

export const transactionQuerySchemas = {
    select: selectTransactionSchema,
    insert: insertTransactionSchema
        .omit({
            id: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
            isHidden: true,
            isNew: true,
        })
        .extend({
            userAmount: amountTransformSchema,
            accountAmount: amountTransformSchema,
            spendingAmount: amountTransformSchema,
            balance: amountTransformSchema,
        }),
    update: updateTransactionSchema.extend({
        userAmount: amountTransformSchema,
        accountAmount: amountTransformSchema,
        spendingAmount: amountTransformSchema,
        balance: amountTransformSchema,
    }),
};

export type TTransactionQuery = {
    select: z.infer<typeof transactionQuerySchemas.select>;
    insert: z.infer<typeof transactionQuerySchemas.insert>;
    update: z.infer<typeof transactionQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const transactionServiceSchemas = {
    create: transactionQuerySchemas.insert.omit({
        userId: true,
        userAmount: true,
        userCurrency: true,
        originalTitle: true,
        importFileId: true,
        connectedBankAccountId: true,
    }),
    update: transactionQuerySchemas.update,
};

export type TTransactionService = {
    create: z.infer<typeof transactionServiceSchemas.create>;
    update: z.infer<typeof transactionServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================

/**
 * Schema for parsing transactions
 */
export const transactionParseSchema = transactionServiceSchemas.create;
export type TTransactionParseSchema = z.infer<typeof transactionParseSchema>;

/**
 * Schema for checking for duplicates in the transaction parse
 */
export const transactionParseDuplicateCheckSchema = transactionParseSchema.extend({
    isDuplicate: z.boolean(),
    existingTransactionId: z.string().optional().nullable(),
});
export type TTransactionParseDuplicateCheck = z.infer<typeof transactionParseDuplicateCheckSchema>;

/**
 * Schema for filtering transactions
 */
export const transactionFilterOptionsSchema = z.object({
    accountIds: z.array(z.string()).optional(),
    labelIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
    type: z.array(z.string()).optional(),
    currencies: z.array(z.string()).optional(),
    search: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});
export type TTransactionFilterOptions = z.infer<typeof transactionFilterOptionsSchema>;

export const transactionPaginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(50),
});
export type TTransactionPagination = z.infer<typeof transactionPaginationSchema>;
