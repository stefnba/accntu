import { createFeatureSchemas, InferSchemas, InferServiceSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

// ====================
// Split Config Schema
// ====================

export const splitConfigSchema = z.object({
    type: z.enum(['equal', 'percentage', 'amount', 'share', 'adjustment']),
    value: z.number().optional(), // Main value (%, amount, ratio)
    baseType: z.string().optional(), // For adjustments ('equal', 'percentage', etc.)
    adjustment: z.number().optional(), // +/- from base
    cap: z.number().optional(), // Max amount
    floor: z.number().optional(), // Min amount
    metadata: z.record(z.string(), z.any()).optional(), // Future extensions
});

export type TSplitConfig = z.infer<typeof splitConfigSchema>;

// ====================
// Split Participant Schema
// ====================

export const splitParticipantSchema = z.object({
    participantId: z.string(),
    name: z.string(),
    email: z.string().optional(),
    splitConfig: splitConfigSchema,
    resolvedAmount: z.number(),
    resolvedPercentage: z.number(),
});

export type TSplitParticipant = z.infer<typeof splitParticipantSchema>;

// ====================
// Factory-based Schemas
// ====================

export const { schemas: transactionBudgetSchemas } = createFeatureSchemas
    .registerTable(dbTable.transactionBudget)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
        userId: true,
        calculatedAt: true,
        isRecalculationNeeded: true,
    })
    .setUserIdField('userId')
    .setIdFields({
        id: true,
    })
    /**
     * Create a transaction budget
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
     * Get many transaction budgets
     */
    .addCore('getMany', ({ buildInput }) => {
        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(10),
        });

        const filtersSchema = z.object({
            transactionId: z.string().optional(),
            splitSource: z.enum(['transaction', 'bucket', 'account', 'none']).optional(),
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
     * Get a transaction budget by id
     */
    .addCore('getById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Update a transaction budget by id
     */
    .addCore('updateById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        return {
            service: buildInput({ data: baseSchema }),
            query: buildInput({ data: baseSchema }),
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Remove a transaction budget by id
     */
    .addCore('removeById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Calculate and store budget for a transaction
     */
    .addCustom('calculateAndStore', () => {
        const schema = z.object({
            transactionId: z.string(),
            userId: z.string(),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: schema.omit({ userId: true }),
            },
        };
    })
    /**
     * Mark transaction budgets for recalculation
     */
    .addCustom('markForRecalculation', () => {
        const schema = z.object({
            transactionId: z.string(),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: schema,
            },
        };
    })
    /**
     * Get transaction budget by transaction and user
     */
    .addCustom('getByTransactionAndUser', () => {
        const schema = z.object({
            transactionId: z.string(),
            userId: z.string(),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: schema.omit({ userId: true }),
            },
        };
    })
    /**
     * Get pending recalculations
     */
    .addCustom('getPendingRecalculation', () => {
        const schema = z.object({});

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: schema,
            },
        };
    });

export const { schemas: transactionBudgetToParticipantSchemas } = createFeatureSchemas
    .registerTable(dbTable.transactionBudgetToParticipant)
    .omit({
        createdAt: true,
        id: true,
    })
    .setIdFields({
        transactionBudgetId: true,
    })
    /**
     * Create participants for a budget
     */
    .addCustom('createParticipants', ({ baseSchema, rawSchema }) => {
        const participantSchema = baseSchema.omit({ transactionBudgetId: true });
        const schema = z.object({
            transactionBudgetId: rawSchema.shape.transactionBudgetId,
            participants: z.array(participantSchema),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: schema,
            },
        };
    })
    /**
     * Remove participants by budget ID
     */
    .addCustom('removeParticipantsByBudgetId', ({ rawSchema }) => {
        const schema = z.object({
            transactionBudgetId: rawSchema.shape.transactionBudgetId,
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: schema,
            },
        };
    })
    /**
     * Get participants by budget ID
     */
    .addCustom('getParticipantsByBudgetId', ({ rawSchema }) => {
        const schema = z.object({
            transactionBudgetId: rawSchema.shape.transactionBudgetId,
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: schema,
            },
        };
    })
    /**
     * Get budgets by participant ID
     */
    .addCustom('getBudgetsByParticipantId', ({ rawSchema }) => {
        const schema = z.object({
            participantId: rawSchema.shape.participantId,
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: schema,
            },
        };
    });

// ====================
// Types
// ====================
export type TTransactionBudgetSchemas = InferSchemas<typeof transactionBudgetSchemas>;
export type TTransactionBudgetToParticipantSchemas = InferSchemas<
    typeof transactionBudgetToParticipantSchemas
>;

export type TTransactionBudgetServices = InferServiceSchemas<typeof transactionBudgetSchemas>;

export { type TTransactionBudget } from '@/features/budget/server/db/queries';
