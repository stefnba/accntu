import { colorSchema } from '@/features/tag/server/db/config';
import { label } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { z } from 'zod';

export const labelTableConfig = createFeatureTableConfig(label)
    .transform((base) =>
        base.extend({
            color: colorSchema,
            name: z.string().min(1, 'Name cannot be empty'),
        })
    )
    .omitBaseSchema(['index'])
    .restrictUpsertFields(['name', 'parentId', 'firstParentId'])
    .enableFiltering({
        search: z.string(),
        parentId: z.string(),
    })
    .enablePagination()
    .build();
