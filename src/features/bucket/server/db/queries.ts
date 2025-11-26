import {
    bucketTableConfig,
    bucketToTransactionTableConfig,
} from '@/features/bucket/server/db/config';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';

export const bucketQueries = createFeatureQueries('bucket', bucketTableConfig).registerAllStandard({
    defaultFilters: {
        isActive: true,
    },
    getMany: {
        defaultOrdering: ['createdAt', 'title'],
        filters: (filters, f) => [f.ilike('title', filters?.search)],
    },
});
export type TBucket = InferFeatureType<typeof bucketQueries>;

export const bucketToTransactionQueries = createFeatureQueries(
    'bucketToTransaction',
    bucketToTransactionTableConfig
).registerAllStandard();
export type TBucketToTransaction = InferFeatureType<typeof bucketToTransactionQueries>;
