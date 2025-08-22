import { labelQueriesTest } from '@/features/label/server/db/queries';
import { label } from '@/features/label/server/db/schema';
import { z } from 'zod';
import { createFeatureSchemas } from './factory';
import { InferSchemaTypes } from './types';

// ============================================================================
// Demo: Complete Schema System Usage
// ============================================================================

/**
 * Step 1: Create feature schemas using the factory
 */
const demoSchemas = createFeatureSchemas({
    feature: 'label',
    table: label,
    queries: labelQueriesTest,
    inputSchemas: {
        // Query layer: Transform base schema for different query operations
        query: (baseSchema) => ({
            getAll: baseSchema.pick({
                id: true,
                name: true,
                color: true,
            }),
            getOne: baseSchema,
            search: baseSchema
                .pick({
                    name: true,
                    color: true,
                })
                .partial(),
        }),

        // Service layer: Create service-specific schemas from query schemas
        service: (querySchemas) => ({
            create: querySchemas.getAll.omit({ id: true }),
            update: querySchemas.getAll.partial().required({ id: true }),
            delete: querySchemas.getAll.pick({ id: true }),
        }),

        // Custom layer: Create complex schemas using all previous layers
        custom: ({ querySchemas, serviceSchemas }) => ({
            assignment: z.object({
                labelIds: z.array(z.string()),
                targetId: z.string(),
            }),
            filter: querySchemas.search,
            bulkUpdate: z.object({
                updates: z.array(serviceSchemas.update),
            }),
        }),
    },
});

/**
 * Step 2: Infer all types from the schemas
 */
export type DemoSchemaTypes = InferSchemaTypes<typeof demoSchemas>;

// ============================================================================
// Type Demonstrations - These should all be properly typed
// ============================================================================

// Return types (for API responses)
export type LabelGetAll = DemoSchemaTypes['return']['getAll']; // { id: string, name: string, color: string }
export type LabelGetOne = DemoSchemaTypes['return']['getOne']; // Full label object
export type LabelSearch = DemoSchemaTypes['return']['search']; // { name?: string, color?: string }

// Input types - Service operations
export type LabelCreate = DemoSchemaTypes['input']['service']['create']; // { name: string, color: string }
export type LabelUpdate = DemoSchemaTypes['input']['service']['update']; // Partial with required id
export type LabelDelete = DemoSchemaTypes['input']['service']['delete']; // { id: string }

// Input types - Query parameters
export type LabelSearchParams = DemoSchemaTypes['input']['query']['search']; // { name?: string, color?: string }

// Input types - Custom operations
export type LabelAssignment = DemoSchemaTypes['input']['custom']['assignment']; // { labelIds: string[], targetId: string }
export type BulkUpdate = DemoSchemaTypes['input']['custom']['bulkUpdate']; // { updates: LabelUpdate[] }

// ============================================================================
// Runtime Usage Examples
// ============================================================================

/**
 * Example: Validate API input using the schemas
 */
export const validateLabelCreate = (data: unknown): LabelCreate => {
    const schemas: DemoSchemaTypes['schemas'] = demoSchemas.inputSchemas;
    return schemas.service.create.parse(data);
};

/**
 * Example: Validate query parameters
 */
export const validateSearchParams = (params: unknown): LabelSearchParams => {
    const schemas = demoSchemas.inputSchemas;
    return schemas.query.search.parse(params);
};

/**
 * Example: Type-safe API response
 */
export const createMockResponse = (): LabelGetAll => ({
    id: '1',
    name: 'Important',
    color: '#ff0000',
});

// ============================================================================
// Benefits Demonstrated
// ============================================================================

/**
 * 1. Type Safety: All types are inferred from actual schemas
 * 2. Runtime Validation: Direct access to Zod schemas for parsing
 * 3. Three-Layer Composition: Query → Service → Custom transformations
 * 4. Full Type Inference: No manual type definitions needed
 * 5. Schema Reuse: Base schema flows through all layers with transformations
 */

export { demoSchemas };
