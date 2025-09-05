import { createSchemasFactory } from '@/lib/schemas/schema-factory';
import { InferSchemas } from '@/lib/schemas/types';
import { tag } from '@/server/db/schemas';

const { opSchemas: schemas } = createSchemasFactory(tag, {
    omitFields: {
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
        userId: true,
        transactionCount: true,
    },
}).buildOpSchemas((builder) =>
    builder
        .addCore('create', ({ baseSchema }) => {
            return {
                query: baseSchema,
            };
        })
        .addCore('getById', ({ rawSchema }) => {
            return {
                query: rawSchema,
            };
        })
);

type TSchemas = InferSchemas<typeof schemas>['query'];
