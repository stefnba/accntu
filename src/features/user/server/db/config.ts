import { user } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';

export const userTableConfig = createFeatureTableConfig(user)
    .pickBaseSchema(['name', 'lastName', 'image', 'settings'])
    .build();
