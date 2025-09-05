import { splitConfigSchema } from '@/features/budget/schemas';
import { participant } from '@/features/participant/server/db/tables';
import { createFeatureSchemas } from '@/lib/schemas';
import { z } from 'zod';

export const { schemas: participantSchemas } = createFeatureSchemas
    .registerTable(participant)
    .omit({
        createdAt: true,
        updatedAt: true,
        id: true,
        isActive: true,
        userId: true,
        totalTransactions: true,
    })
    .userField('userId')
    .idFields({ id: true })
    /**
     * Create a participant
     */
    .addCore('create', ({ baseSchema, buildServiceInput }) => ({
        service: buildServiceInput({ data: baseSchema }),
        query: buildServiceInput({ data: baseSchema }),
        endpoint: { json: baseSchema },
    }))
    /**
     * Update a participant by id
     */
    .addCore('updateById', ({ baseSchema, buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput({ data: baseSchema }),
            query: buildServiceInput({ data: baseSchema }),
            endpoint: {
                json: baseSchema,
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Remove a participant by id
     */
    .addCore('removeById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: { param: idFieldsSchema },
        };
    })
    /**
     * Get a participant by id
     */
    .addCore('getById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: { param: idFieldsSchema },
        };
    });

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
export type TParticipantToConnectedBankAccount = z.infer<
    typeof participantToConnectedBankAccountSchema
>;
export type TParticipantToBucket = z.infer<typeof participantToBucketSchema>;
