import {
    insertBucketSchema,
    selectBucketSchema,
    updateBucketSchema,
} from '@/features/bucket/server/db/schemas';
import { z } from 'zod';

export const bucketQuerySchemas = {
    select: selectBucketSchema,
    insert: insertBucketSchema,
    update: updateBucketSchema,
};
export type TBucketQuery = {
    select: z.infer<typeof bucketQuerySchemas.select>;
    insert: z.infer<typeof bucketQuerySchemas.insert>;
    update: z.infer<typeof bucketQuerySchemas.update>;
};

export const bukcetServiceSchemas = {
    select: selectBucketSchema,
    insert: insertBucketSchema,
    update: updateBucketSchema,
};
export type TBucketService = {
    select: z.infer<typeof bukcetServiceSchemas.select>;
    insert: z.infer<typeof bukcetServiceSchemas.insert>;
    update: z.infer<typeof bukcetServiceSchemas.update>;
};
