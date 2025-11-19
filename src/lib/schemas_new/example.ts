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
    .addSchema('update', ({ schemas, helpers }) => ({
        query: schemas.base,
        body: schemas.inputData.update,
        endpoint: {
            json: schemas.table.update,
            form: helpers.buildPaginationSchema(),
        },
    }));

const schemas = tagSchemas.schemas.update.endpoint.form;

type TestQuery = z.infer<typeof schemas>[];

type A = InferSchemasByLayer<typeof tagSchemas.schemas, 'endpoint'>;
type B = keyof A;
