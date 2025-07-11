import {
    insertBucketSchema,
    selectBucketSchema,
    updateBucketSchema,
} from '@/features/bucket/server/db/schema';
import { z } from 'zod';

// ====================
// Query
// ====================

export const bucketQuerySchemas = {
    select: selectBucketSchema,
    insert: insertBucketSchema.omit({
        userId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
    }),
    update: updateBucketSchema.omit({
        userId: true,
        id: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
    }),
};

export type TBucketQuery = {
    select: z.infer<typeof bucketQuerySchemas.select>;
    insert: z.infer<typeof bucketQuerySchemas.insert>;
    update: z.infer<typeof bucketQuerySchemas.update>;
};

// ====================
// Service/Endpoint
// ====================

export const bucketServiceSchemas = {
    create: bucketQuerySchemas.insert,
    update: bucketQuerySchemas.update,
};

export type TBucketService = {
    create: z.infer<typeof bucketServiceSchemas.create>;
    update: z.infer<typeof bucketServiceSchemas.update>;
    select: z.infer<typeof bucketQuerySchemas.select>;
};
