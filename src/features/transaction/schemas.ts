import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

const numericInputSchema = z.coerce.number();

export const {
    schemas: transactionSchemas,
    idFields,
    idSchema,
    rawSchema,
    baseSchema,
} = createFeatureSchemas
    .registerTable(dbTable.transaction)
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
    .userField('userId')
    .idFields({
        id: true,
    })
    /**
     * Create a transaction
     */
    .addCore('create', ({ baseSchema, buildServiceInput }) => {
        const input = buildServiceInput({ data: baseSchema });
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
    .addCore('getMany', ({ buildServiceInput }) => {
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

        const input = buildServiceInput({
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
    .addCore('getById', ({ buildServiceInput, idFieldsSchema }) => {
        const input = buildServiceInput();
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
    .addCore('updateById', ({ baseSchema, buildServiceInput, idFieldsSchema }) => {
        const input = buildServiceInput({ data: baseSchema.partial() });
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
    .addCore('removeById', ({ buildServiceInput }) => {
        const input = buildServiceInput();
        return {
            service: input,
            query: input,
            endpoint: {
                param: z.object({ id: z.string() }),
            },
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
