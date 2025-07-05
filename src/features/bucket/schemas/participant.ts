import {
    insertBucketParticipantSchema,
    selectBucketParticipantSchema,
    updateBucketParticipantSchema,
} from '@/features/bucket/server/db/schemas';
import { z } from 'zod';

// ====================
// Query
// ====================

export const bucketParticipantQuerySchemas = {
    select: selectBucketParticipantSchema,
    insert: insertBucketParticipantSchema.omit({
        userId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        totalTransactions: true,
    }),
    update: updateBucketParticipantSchema.omit({
        userId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
    }),
};

export type TBucketParticipantQuery = {
    select: z.infer<typeof bucketParticipantQuerySchemas.select>;
    insert: z.infer<typeof bucketParticipantQuerySchemas.insert>;
    update: z.infer<typeof bucketParticipantQuerySchemas.update>;
};

// ====================
// Service/Endpoint
// ====================

export const bucketParticipantServiceSchemas = {
    create: bucketParticipantQuerySchemas.insert,
    update: bucketParticipantQuerySchemas.update,
};
export type TBucketParticipantService = {
    create: z.infer<typeof bucketParticipantServiceSchemas.create>;
    update: z.infer<typeof bucketParticipantServiceSchemas.update>;
};

// ====================
// Custom
// ====================
