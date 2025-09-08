import { splitConfigSchema } from '@/features/budget/schemas';
import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

export const { schemas: participantSchemas } = createFeatureSchemas
    .registerTable(dbTable.participant)
    .omit({
        createdAt: true,
        updatedAt: true,
        id: true,
        isActive: true,
        userId: true,
        totalTransactions: true,
    })
    .setUserIdField('userId')
    .setIdFields({ id: true })
    /**
     * Create a participant
     */
    .addCore('create', ({ baseSchema, buildInput }) => ({
        service: buildInput({ data: baseSchema }),
        query: buildInput({ data: baseSchema }),
        endpoint: { json: baseSchema },
    }))
    /**
     * Get many participants
     */
    .addCore('getMany', ({ buildInput }) => {
        const paginationSchema = z.object({
            page: z.coerce.number().int().default(1),
            pageSize: z.coerce.number().int().default(10),
        });

        const filtersSchema = z.object({
            search: z.string().optional(),
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
     * Update a participant by id
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
     * Remove a participant by id
     */
    .addCore('removeById', ({ buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: { param: idFieldsSchema },
        };
    })
    /**
     * Get a participant by id
     */
    .addCore('getById', ({ buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
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

// ====================
// Types
// ====================
export type TParticipantSchemas = InferSchemas<typeof participantSchemas>;

export type TParticipantToTransaction = z.infer<typeof participantToTransactionSchema>;
export type TParticipantToConnectedBankAccount = z.infer<
    typeof participantToConnectedBankAccountSchema
>;
export type TParticipantToBucket = z.infer<typeof participantToBucketSchema>;

export { type TParticipant } from '@/features/participant/server/db/queries';
