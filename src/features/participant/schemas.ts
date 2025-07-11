import {
    insertParticipantSchema,
    selectParticipantSchema,
    updateParticipantSchema,
} from '@/features/participant/server/db/schema';
import { splitConfigSchema } from '@/features/budget/schemas';
import { z } from 'zod';

// ====================
// Query
// ====================

export const participantQuerySchemas = {
    select: selectParticipantSchema,
    insert: insertParticipantSchema.omit({
        userId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        totalTransactions: true,
    }),
    update: updateParticipantSchema.omit({
        userId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
    }),
};

export type TParticipantQuery = {
    select: z.infer<typeof participantQuerySchemas.select>;
    insert: z.infer<typeof participantQuerySchemas.insert>;
    update: z.infer<typeof participantQuerySchemas.update>;
};

// ====================
// Service/Endpoint
// ====================

export const participantServiceSchemas = {
    create: participantQuerySchemas.insert,
    update: participantQuerySchemas.update,
};

export type TParticipantService = {
    create: z.infer<typeof participantServiceSchemas.create>;
    update: z.infer<typeof participantServiceSchemas.update>;
};

// ====================
// Split Config Schemas for Junction Tables
// ====================

export const participantToTransactionSchema = z.object({
    participantId: z.string(),
    transactionId: z.string(),
    splitConfig: splitConfigSchema,
    notes: z.string().optional(),
});

export const participantToConnectedBankAccountSchema = z.object({
    participantId: z.string(),
    connectedBankAccountId: z.string(),
    splitConfig: splitConfigSchema,
    notes: z.string().optional(),
});

export const participantToBucketSchema = z.object({
    participantId: z.string(),
    bucketId: z.string(),
    splitConfig: splitConfigSchema,
    notes: z.string().optional(),
});

export type TParticipantToTransaction = z.infer<typeof participantToTransactionSchema>;
export type TParticipantToConnectedBankAccount = z.infer<typeof participantToConnectedBankAccountSchema>;
export type TParticipantToBucket = z.infer<typeof participantToBucketSchema>;