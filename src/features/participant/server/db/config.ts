import { participant } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

export const participantTableConfig = createFeatureTableConfig(participant)
    .restrictUpsertFields(['name', 'email'])
    .enableFiltering({
        search: z.string().optional(),
    })
    .enablePagination()
    .setUserId('userId')
    .build();
