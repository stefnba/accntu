import { dbTable } from '@/server/db';
import { z } from 'zod';

// ====================
// Split Config Schema
// ====================

export const splitConfigSchema = z.object({
    type: z.enum(['equal', 'percentage', 'amount', 'share', 'adjustment']),
    value: z.number().optional(),              // Main value (%, amount, ratio)
    baseType: z.string().optional(),           // For adjustments ('equal', 'percentage', etc.)
    adjustment: z.number().optional(),         // +/- from base
    cap: z.number().optional(),                // Max amount
    floor: z.number().optional(),              // Min amount
    metadata: z.record(z.any()).optional(),    // Future extensions
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
// Query Schemas
// ====================

export const transactionBudgetQuerySchemas = {
    select: selectTransactionBudgetSchema,
    insert: insertTransactionBudgetSchema.omit({
        userId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        calculatedAt: true,
    }),
    update: updateTransactionBudgetSchema.omit({
        userId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
    }),
};

export type TTransactionBudgetQuery = {
    select: z.infer<typeof transactionBudgetQuerySchemas.select>;
    insert: z.infer<typeof transactionBudgetQuerySchemas.insert>;
    update: z.infer<typeof transactionBudgetQuerySchemas.update>;
};

export const transactionBudgetToParticipantQuerySchemas = {
    select: selectTransactionBudgetToParticipantSchema,
    insert: insertTransactionBudgetToParticipantSchema.omit({
        id: true,
        createdAt: true,
    }),
    update: updateTransactionBudgetToParticipantSchema.omit({
        id: true,
        createdAt: true,
    }),
};

export type TTransactionBudgetToParticipantQuery = {
    select: z.infer<typeof transactionBudgetToParticipantQuerySchemas.select>;
    insert: z.infer<typeof transactionBudgetToParticipantQuerySchemas.insert>;
    update: z.infer<typeof transactionBudgetToParticipantQuerySchemas.update>;
};

// ====================
// Service/Endpoint Schemas
// ====================

export const transactionBudgetServiceSchemas = {
    create: transactionBudgetQuerySchemas.insert,
    update: transactionBudgetQuerySchemas.update,
    calculate: z.object({
        transactionId: z.string(),
        userId: z.string(),
    }),
    recalculate: z.object({
        transactionId: z.string(),
    }),
};

export type TTransactionBudgetService = {
    create: z.infer<typeof transactionBudgetServiceSchemas.create>;
    update: z.infer<typeof transactionBudgetServiceSchemas.update>;
    calculate: z.infer<typeof transactionBudgetServiceSchemas.calculate>;
    recalculate: z.infer<typeof transactionBudgetServiceSchemas.recalculate>;
};