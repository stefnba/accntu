import { bucketTableConfig } from '@/features/bucket/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';

export const bucketSchemas = createFeatureSchemas(bucketTableConfig).registerAllStandard().build();

// ====================
// Types
// ====================
export { type TBucket } from '@/features/bucket/server/db/queries';
