import { tag, tagToTransaction } from '@/features/tag/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

export const colorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format');

export const tagTableConfig = createFeatureTableConfig(tag)
    .omitBaseSchema(['transactionCount'])
    .transformBaseSchema((base) =>
        base.extend({
            color: colorSchema,
            name: z.string().min(1, 'Name cannot be empty'),
        })
    )
    .enablePagination()
    .enableFiltering({
        name: z.string(),
    })
    .enableOrdering(['createdAt', 'name'])
    .build();

export const tagToTransactionTableConfig = createFeatureTableConfig(tagToTransaction)
    .setIds(['tagId', 'transactionId'])
    .build();
