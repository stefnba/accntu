import { FeatureSchema } from '@/lib/schemasBuilder/factory';
import {
    InferSchemas,
    InferSchemasByLayer,
    InferSchemasByOperation,
} from '@/lib/schemasBuilder/types';
import { tag } from '@/server/db/schemas';
import { z } from 'zod';

// Example 1: Simple fromTable usage (all fields)
const tagSchemas = FeatureSchema.fromTable(tag, {
    pickFields: ['name', 'id'],
}).withOperationBuilder((builder) =>
    builder
        .addOperation('create', ({ baseSchema }) => ({
            // service: baseSchema.pick({ name: true }),
            query: baseSchema.pick({ name: true, id: true }),
            endpoint: baseSchema.omit({ id: true }),
        }))
        .addOperation('updateById', ({ baseSchema }) => ({
            endpoint: baseSchema.omit({ id: true }),
        }))
        .addOperation('getById', ({ baseSchema }) => ({
            // endpoint: baseSchema.pick({ id: true }),
            query: baseSchema.pick({ id: true }).required(),
            // endpoint: builder.defineSchema.endpoint({ id: baseSchema.pick({ id: true }) }),
        }))
);

export const createQuery = tagSchemas.getById.query;

type SASAS = z.infer<typeof createQuery>;

const ddd: SASAS = {
    id: 'dd',
    // id: 'ddd', /
};

type TagOperations = InferSchemasByOperation<typeof tagSchemas>;

type TagServices = InferSchemasByLayer<'service', typeof tagSchemas>;

type adfa = TagServices['create'];

type TagSchemas = InferSchemas<typeof tagSchemas>;

type TTTT = TagSchemas['query']['getById'];
