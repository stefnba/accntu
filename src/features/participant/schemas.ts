import { splitConfigSchema } from '@/features/budget/schemas';
import { participant } from '@/features/participant/server/db/tables';
import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { z } from 'zod';

/**
 * Reusable schema for optional email fields that properly handles HTML form behavior.
 *
 * HTML form inputs return empty strings ("") when cleared, but Zod's .optional() treats
 * fields as potentially undefined, not empty strings. This schema bridges that gap by:
 * - Accepting empty strings, null, or undefined values
 * - Transforming empty strings to undefined for clean type inference
 * - Only validating email format when a value actually exists
 * - Providing clear error messages for invalid email formats
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   email: optionalEmail, // Can be empty or a valid email
 * });
 * ```
 */
export const optionalEmail = z
    .string()
    .optional()
    .transform((val) => (val === '' || !val ? undefined : val))
    .refine((val) => !val || z.email().safeParse(val).success, {
        message: 'Invalid email format',
    });

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
    .transform((base) =>
        base
            .extend({
                email: optionalEmail,
                name: z.string().min(1, 'Name cannot be empty'),
            })
            .omit({
                linkedUserId: true,
            })
    )
    .setUserIdField('userId')
    .setIdFields({ id: true })
    /**
     * Create a participant
     */
    .addCore('create', ({ baseSchema, buildInput }) => ({
        service: buildInput({ data: baseSchema }),
        form: baseSchema,
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
            service: buildInput({ data: baseSchema.partial() }),
            query: buildInput({ data: baseSchema.partial() }),
            form: baseSchema.partial(),
            endpoint: {
                json: baseSchema.partial(),
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

// ====================
// Legacy Support
// ====================
export const participantServiceSchemas = {
    insert: participantSchemas.create.endpoint.json,
    update: participantSchemas.updateById.endpoint.json,
};
