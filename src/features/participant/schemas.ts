import { splitConfigSchema } from '@/features/budget/schemas';
import { participantTableConfig } from '@/features/participant/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';
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
// export const optionalEmail = z
//     .string()
//     .optional()
//     .transform((val) => (val === '' || !val ? undefined : val))
//     .refine((val) => !val || z.email().safeParse(val).success, {
//         message: 'Invalid email format',
//     });

//     transformBaseSchema((base) =>
//         base
//             .extend({
//                 email: optionalEmail,
//                 name: z.string().min(1, 'Name cannot be empty'),
//             })
//             .omit({
//                 linkedUserId: true,
//             })
//     )

export const participantSchemas = createFeatureSchemas(participantTableConfig)
    .registerAllStandard()
    .build();

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

export { type TParticipant } from '@/features/participant/server/db/queries';
