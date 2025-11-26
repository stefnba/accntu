import { bucket, bucketToTransaction } from '@/features/bucket/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

export const bucketTableConfig = createFeatureTableConfig(bucket)
    .pickBaseSchema(['title', 'type', 'status'])
    .transformBaseSchema((base) =>
        base.extend({
            title: z.string().min(1, 'Title cannot be empty'),
        })
    )
    .enablePagination()
    .enableFiltering({
        search: z.string(),
    })
    .enableOrdering(['createdAt', 'title'])
    .build();

export const bucketToTransactionTableConfig = createFeatureTableConfig(bucketToTransaction)
    .pickBaseSchema(['notes'])
    .build();
