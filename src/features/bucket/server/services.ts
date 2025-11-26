import { bucketSchemas } from '@/features/bucket/schemas';
import { bucketQueries } from '@/features/bucket/server/db/queries';
import { createFeatureServices } from '@/server/service';

export const bucketServices = createFeatureServices('bucket')
    .registerSchema(bucketSchemas)
    .registerQueries(bucketQueries.build())
    .withStandard((builder) =>
        builder.create().getById().getMany().updateById().removeById().createMany()
    )
    .build();
