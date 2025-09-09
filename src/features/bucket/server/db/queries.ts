import { bucketSchemas } from '@/features/bucket/schemas';
import { dbTable } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';

export const bucketQueries = createFeatureQueries
    .registerSchema(bucketSchemas)
    .registerCoreQueries(dbTable.bucket, {
        idFields: ['id'],
        userIdField: 'userId',
        defaultIdFilters: {
            isActive: true,
        },
        queryConfig: {
            getMany: {
                filters: (filters, f) => [f.ilike('title', filters?.search)],
            },
        },
    });

export type TBucket = InferFeatureType<typeof bucketQueries>;
