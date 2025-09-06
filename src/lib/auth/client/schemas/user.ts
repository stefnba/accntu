import { createFeatureSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';

export const { schemas: userSchemas } = createFeatureSchemas
    .registerTable(dbTable.user)
    .pick({ name: true, lastName: true, image: true, settings: true })
    .idFields({ id: true })
    .addCore('updateById', ({ baseSchema, idFieldsSchema }) => ({
        service: baseSchema,
        query: baseSchema,
        endpoint: { json: baseSchema, param: idFieldsSchema },
    }));
