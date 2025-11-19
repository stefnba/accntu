import {
    bucketTableConfig,
    bucketToTransactionTableConfig,
} from '@/features/bucket/server/db/tables';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';

export const bucketQueries = createFeatureQueries('bucket', bucketTableConfig).registerAllStandard({
    defaultFilters: {
        isActive: true,
    },
});

// getMany: {
//     filters: (filters, f) => [f.ilike('title', filters?.search)],
// },

export const bucketToTransactionQueries = createFeatureQueries(
    'bucketToTransaction',
    bucketToTransactionTableConfig
).registerAllStandard();

export type TBucket = InferFeatureType<typeof bucketQueries>;
export type TBucketToTransaction = InferFeatureType<typeof bucketToTransactionQueries>;
