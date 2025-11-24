import { createFeatureSchemas } from '@/lib/schemas_new/factory';
import { InferSchemasByLayer } from '@/lib/schemas_new/types';
import { tag } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';

export const tagTableConfig = createFeatureTableConfig(tag)
    .omitBaseSchema(['transactionCount'])
    // .removeUserId()
    // .removeIds()
    // .setIds(['id'])
    // .setUserId('userId')
    // .enableFiltering({
    //     name: z.string(),
    // })
    .enablePagination()
    // .enableOrdering(['createdAt'])
    .build();

export const tagSchemas = createFeatureSchemas(tagTableConfig)
    .addSchema('test', ({ schemas, helpers }) => ({
        query: schemas.base,
        body: schemas.inputData.insert,
        endpoint: {
            json: schemas.table.insert,
            form: helpers.buildIdentifierSchema(),
        },
    }))
    .withStandard((b) => b.create().getById().getMany())
    .build();

// ==============================
// Schemas
// ==============================

export const getManyService = tagSchemas.getMany.service;
export type TGetManyService = z.infer<typeof getManyService>;

type A = InferSchemasByLayer<typeof tagSchemas, 'query'>;
type B = keyof A;
