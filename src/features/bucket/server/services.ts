import { bucketSchemas } from '@/features/bucket/schemas';
import { bucketQueries } from '@/features/bucket/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/';

export const bucketServices = createFeatureServices('bucket')
    .registerSchemas(bucketSchemas)
    .registerQueries(bucketQueries)
    .registerCoreServices()
    .build();
