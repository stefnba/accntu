import { transactionTableConfig } from '@/features/transaction/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';
import { z } from 'zod';

export const transactionSchemas = createFeatureSchemas(transactionTableConfig)
    .registerAllStandard()
    /**
     * Get many transactions
     */
    .addSchema('getMany', ({ schemas }) => {
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

        const input = schemas.inputData.insert.extend({
            data: filtersSchema,
        });

        return { service: input, query: input, endpoint: { query: filtersSchema } };
    })
    /**
     * Validate a transaction import
     */
    .addSchema('validateImport', ({ schemas }) => {
        const validateSchema = schemas.inputData.insert.omit({
            userAmount: true,
            userCurrency: true,
            connectedBankAccountId: true,
            importFileId: true,
            originalTitle: true,
        });
        return { service: validateSchema };
    })
    /**
     * Create many transactions from import
     */
    .addSchema('createManyFromImport', ({ schemas }) => {
        const s = schemas.inputData.insert.extend({
            isDuplicate: z.boolean(),
            existingTransactionId: z.string().optional().nullable(),
        });

        const input = z.object({
            userId: z.string(),
            data: z.object({
                transactions: z.array(s),
                importFileId: z.string(),
            }),
        });

        return {
            service: input,
            query: input,
            endpoint: { json: z.array(schemas.inputData.insert) },
        };
    })
    .addSchema('getFilterOptions', ({ schemas }) => {
        const input = schemas.userId;
        return { service: input, query: input };
    })
    .build();
