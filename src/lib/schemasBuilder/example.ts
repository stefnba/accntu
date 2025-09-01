import { FeatureSchema } from '@/lib/schemasBuilder/factory';
import {
    InferSchemas,
    InferSchemasByLayer,
    InferSchemasByOperation,
} from '@/lib/schemasBuilder/types';
import { tag } from '@/server/db/schemas';
import { z } from 'zod';

// Example 1: Enhanced builder with duplicate prevention and custom operations
const tagSchemas = FeatureSchema.fromTable(tag, {
    pickFields: ['name', 'id'],
}).withOperationBuilder((builder) =>
    builder
        // Core CRUD operation - 'create' will no longer appear in subsequent IntelliSense
        .addOperation('create', ({ baseSchema }) => ({
            query: baseSchema.pick({ name: true, id: true }),
            endpoint: baseSchema.omit({ id: true }),
        }))
        // Core CRUD operation - 'updateById' will no longer appear in subsequent IntelliSense
        .addOperation('updateById', ({ baseSchema }) => ({
            endpoint: baseSchema.omit({ id: true }),
        }))
        // Core CRUD operation - 'getById' will no longer appear in subsequent IntelliSense
        .addOperation('getById', ({ baseSchema }) => ({
            query: baseSchema.pick({ id: true }).required(),
        }))
        // Custom operation - this shows you can add operations beyond core CRUD
        .addOperation('assignToCategory', ({ baseSchema }) => ({
            service: z.object({
                tagIds: z.array(z.string()),
                categoryId: z.string(),
            }),
            endpoint: z.object({
                tagIds: z.array(z.string()),
                categoryId: z.string(),
            }),
        }))
        // Another custom operation
        .addOperation('getMany', ({ baseSchema }) => ({
            service: z.object({
                tags: z.array(baseSchema.partial().extend({ id: z.string() })),
            }),
            endpoint: z.object({
                tags: z.array(baseSchema.partial().extend({ id: z.string() })),
            }),
        }))
);

export const createQuery = tagSchemas.create.endpoint;

type SASAS = z.infer<typeof createQuery>;

const ddd: SASAS = {
    name: 'ddd',
    // id: 'ddd', /
};

type TagOperations = InferSchemasByOperation<typeof tagSchemas>;

type TagServices = InferSchemasByLayer<'service', typeof tagSchemas>;

type adfa = TagServices['create'];

type TagSchemas = InferSchemas<typeof tagSchemas>;

type TTTT = TagSchemas['services']['getMany'];
