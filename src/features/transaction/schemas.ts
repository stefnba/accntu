import { transaction } from '@/features/transaction/server/db/tables';
import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { z } from 'zod';

const numericInputSchema = z.coerce.number();

export const {
    schemas: transactionSchemas,
    setIdFields,
    idSchema,
    rawSchema,
    baseSchema,
} = createFeatureSchemas
    .registerTable(transaction)
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isHidden: true,
        isNew: true,
        userId: true,
    })
    .transform((base) =>
        base.extend({
            userAmount: numericInputSchema,
            accountAmount: numericInputSchema,
            spendingAmount: numericInputSchema,
            balance: numericInputSchema.optional(),
        })
    )
    .setUserIdField('userId')
    .setIdFields({
        id: true,
    })
    /**
     * Create a transaction
     */
    .addCore('create', ({ baseSchema, buildInput }) => {
        const input = buildInput({ data: baseSchema });
        return {
            service: input,
            query: input,
            endpoint: {
                json: baseSchema,
            },
        };
    })
    /**
     * Get many transactions
     */
    .addCore('getMany', ({ buildInput }) => {
        const paginationSchema = z.object({
            page: z.coerce.number().min(1).default(1),
            pageSize: z.coerce.number().min(1).max(100).default(50),
        });

        const filtersSchema = z.object({
            accountIds: z
                .preprocess(
                    (value) => (typeof value === 'string' ? [value] : value),
                    z.array(z.string())
                )
                .optional(),
            labelIds: z
                .preprocess(
                    (value) => (typeof value === 'string' ? [value] : value),
                    z.array(z.string())
                )
                .optional(),
            tagIds: z
                .preprocess(
                    (value) => (typeof value === 'string' ? [value] : value),
                    z.array(z.string())
                )
                .optional(),
            type: z
                .preprocess(
                    (value) => (typeof value === 'string' ? [value] : value),
                    z.array(z.string())
                )
                .optional(),
            currencies: z
                .preprocess(
                    (value) => (typeof value === 'string' ? [value] : value),
                    z.array(z.string())
                )
                .optional(),
            search: z.string().optional(),
            startDate: z.coerce.date().optional(),
            endDate: z.coerce.date().optional(),
        });

        const input = buildInput({
            pagination: paginationSchema,
            filters: filtersSchema,
        });

        return {
            service: input,
            query: input,
            endpoint: {
                query: paginationSchema.extend(filtersSchema.shape),
            },
        };
    })
    /**
     * Get a transaction by ID
     */
    .addCore('getById', ({ buildInput, idFieldsSchema }) => {
        const input = buildInput();
        return {
            service: input,
            query: input,
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Update a transaction by ID
     */
    .addCore('updateById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        const input = buildInput({ data: baseSchema.partial() });
        return {
            service: input,
            query: input,
            endpoint: {
                param: idFieldsSchema,
                json: baseSchema.partial(),
            },
        };
    })
    /**
     * Remove a transaction by ID
     */
    .addCore('removeById', ({ buildInput }) => {
        const input = buildInput();
        return {
            service: input,
            query: input,
            endpoint: {
                param: z.object({ id: z.string() }),
            },
        };
    })
    /**
     * Validate a transaction import
     */
    .addCustom('validateImport', ({ baseSchema }) => {
        const validateSchema = baseSchema.omit({
            userAmount: true,
            userCurrency: true,
            connectedBankAccountId: true,
            accountAmount: true,
            importFileId: true,
            originalTitle: true,
        });
        return {
            service: validateSchema,
        };
    });

export type TTransactionSchemas = InferSchemas<typeof transactionSchemas>;

// ====================
// Custom Schemas for backward compatibility
// ====================

// Legacy types for existing code
export type TTransactionFilterOptions = z.infer<
    typeof transactionSchemas.getMany.service
>['filters'];
export type TTransactionPagination = z.infer<
    typeof transactionSchemas.getMany.service
>['pagination'];

/**
 * Schema for parsing transactions
 */
export const transactionParseSchema = transactionSchemas.create.service.shape.data;
export type TTransactionParseSchema = z.infer<typeof transactionParseSchema>;

/**
 * Schema for checking for duplicates in the transaction parse
 */
export const transactionParseDuplicateCheckSchema = transactionParseSchema.extend({
    isDuplicate: z.boolean(),
    existingTransactionId: z.string().optional().nullable(),
});
export type TTransactionParseDuplicateCheck = z.infer<typeof transactionParseDuplicateCheckSchema>;
