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
        // Core CRUD operation with Hono validation targets
        .addOperation('create', ({ baseSchema }) => ({
            query: baseSchema.pick({ name: true, id: true }),
            endpoint: {
                json: baseSchema.omit({ id: true }), // Request body validation
                query: z.object({
                    returnId: z.boolean().optional(),
                }), // Query parameters
            },
        }))
        // Update operation with parameter validation
        .addOperation('updateById', ({ baseSchema }) => ({
            endpoint: {
                param: z.object({ id: z.string() }), // Route parameters
                json: baseSchema.omit({ id: true }), // Request body
            },
        }))
        // Get by ID operation
        .addOperation('getById', ({ baseSchema }) => ({
            query: baseSchema.pick({ id: true }).required(),
            endpoint: {
                param: z.object({ id: z.string() }), // Route parameters
                query: z
                    .object({
                        include: z.array(z.string()).optional(),
                    })
                    .optional(), // Query parameters
            },
        }))
        // Custom operation with comprehensive validation
        .addOperation('assignToCategory', ({ baseSchema }) => ({
            service: z.object({
                tagIds: z.array(z.string()),
                categoryId: z.string(),
            }),
            endpoint: {
                param: z.object({
                    id: z.string(),
                }),
            },
        }))
        // Another custom operation
        .addOperation('getMany', ({ baseSchema }) => ({
            service: z.object({
                tags: z.array(baseSchema.partial().extend({ id: z.string() })),
            }),
            endpoint: {
                json: z.object({
                    tags: z.array(baseSchema.partial().extend({ id: z.string() })),
                }),
                param: z.object({
                    id: z.string(),
                }),
            },
        }))
);

// Test new endpoint structure access
export const createEndpoint = tagSchemas.assignToCategory.endpoint.param;
export const createEndpointJson = tagSchemas.create.endpoint.json;
export const createEndpointQuery = tagSchemas.create.endpoint.query;

export const updateByIdParam = tagSchemas.updateById.endpoint.param;
export const updateByIdJson = tagSchemas.updateById.endpoint.json;

export const getManyService = tagSchemas.getMany.service;
export const getManyEndpointJson = tagSchemas.getMany.endpoint.json;

// Test type inference for new endpoint structure
type CreateEndpointJson = z.infer<typeof createEndpointJson>;
type CreateEndpointQuery = z.infer<typeof createEndpointQuery>;
type UpdateByIdParam = z.infer<typeof updateByIdParam>;

// Test actual data types
const createJsonData: CreateEndpointJson = {
    name: 'New Tag',
    // id is omitted as expected
};

const createQueryData: CreateEndpointQuery = {
    returnId: true,
};

const updateParamData: UpdateByIdParam = {
    id: 'tag-123',
};

type TagOperations = InferSchemasByOperation<typeof tagSchemas>;

type TagServices = InferSchemasByLayer<'endpoint', typeof tagSchemas>;

type adfa = TagServices['assignToCategory']['param'];

type TagSchemas = InferSchemas<typeof tagSchemas>;

type TTTT = TagSchemas['services']['getMany'];
