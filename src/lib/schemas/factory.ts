import { labelQueriesTest } from '@/features/label/server/db/queries';
import { label } from '@/features/label/server/db/schema';
import { TCustomQueries } from '@/server/lib/db/query/factory/types';
import { Table } from 'drizzle-orm';
import { BuildSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Enhanced factory function with three-layer schema composition
 * Supports query → service → custom schema transformations with full type safety
 */
export function createFeatureSchemas<
    TQueries extends TCustomQueries,
    TTable extends Table,
    TQuerySchemas extends Partial<Record<keyof TQueries, unknown>>,
    TServiceSchemas extends Record<string, unknown>,
    TCustomSchemas extends Record<string, unknown>,
>(config: {
    feature: string;
    queries: TQueries;
    table: TTable;
    inputSchemas: {
        query: (
            baseSchema: BuildSchema<'select', TTable['_']['columns'], undefined>
        ) => TQuerySchemas;
        service: (querySchemas: TQuerySchemas) => TServiceSchemas;
        custom: (schemas: {
            baseSchema: BuildSchema<'select', TTable['_']['columns'], undefined>;
            querySchemas: TQuerySchemas;
            serviceSchemas: TServiceSchemas;
        }) => TCustomSchemas;
    };
}) {
    const { table, inputSchemas, feature } = config;

    const baseSchema = createSelectSchema(table);

    const queryResult = inputSchemas.query(baseSchema);
    const serviceResult = inputSchemas.service(queryResult);
    const customResult = inputSchemas.custom({
        baseSchema,
        querySchemas: queryResult,
        serviceSchemas: serviceResult,
    });

    return {
        inputSchemas: {
            query: queryResult,
            service: serviceResult,
            custom: customResult,
        },
        feature,
    } as const;
}

// Test implementation with the new three-layer API
const labelSchemas = createFeatureSchemas({
    feature: 'label',
    table: label,
    queries: labelQueriesTest,
    inputSchemas: {
        query: (baseSchema) => ({
            getAll: baseSchema.pick({
                id: true,
                name: true,
                color: true,
            }),
            getById: baseSchema,
            getAllFlattened: baseSchema.pick({
                id: true,
                name: true,
                color: true,
                parentId: true,
            }),
            create: baseSchema.omit({ id: true }),
            reorder: baseSchema
                .pick({
                    id: true,
                    parentId: true,
                    index: true,
                })
                .extend({
                    blaaaaa: z.string(),
                }),
        }),
        service: (querySchemas) => ({
            create: querySchemas.getAll.omit({ id: true }),
            update: querySchemas.getAll.partial().required({ id: true }),
            delete: querySchemas.getAll.pick({ id: true }),
            blaaaaa: querySchemas.reorder.pick({ blaaaaa: true }),
        }),
        custom: ({ baseSchema, querySchemas }) => ({
            assignment: z.object({
                labelIds: z.array(z.string()),
            }),
            filter: baseSchema
                .pick({
                    name: true,
                    color: true,
                })
                .partial(),
            searchFilters: querySchemas.getAllFlattened.partial(),
        }),
    },
});

/**
 * Example usage demonstrating full type safety through the schema chain:
 * - Query layer receives base Drizzle schema with full type information
 * - Service layer receives typed query schemas and can transform them
 * - Custom layer receives all previous schemas with preserved types
 * - All schema transformations (.pick, .omit, .extend) maintain type safety
 */

// Export for testing - demonstrates that type inference works correctly
export { labelSchemas };

// Type tests - these should all be properly typed (not 'any')
export type TestQueryGetAll = z.infer<typeof labelSchemas.inputSchemas.query.getAll>;
export type TestServiceCreate = z.infer<typeof labelSchemas.inputSchemas.service.create>;
export type TestCustomAssignment = z.infer<typeof labelSchemas.inputSchemas.custom.assignment>;

export type TestServiceBlaaaa = z.infer<typeof labelSchemas.inputSchemas.service.blaaaaa>;

// ============================================================================
// InferSchemaTypes Integration Test
// ============================================================================

import { InferSchemaTypes } from './types';

// Create the inferred types from labelSchemas
export type LabelSchemaTypes = InferSchemaTypes<typeof labelSchemas>;

// Type tests demonstrating the complete type inference system
export type TestReturnGetAll = LabelSchemaTypes['return']['getAll']; // { id: string, name: string, color: string }
export type TestInputServiceCreate = LabelSchemaTypes['input']['service']['create']; // { name: string }
export type TestInputCustomAssignment = LabelSchemaTypes['input']['custom']['assignment']; // { labelIds: string[] }
export type TestInputCustomFilter = LabelSchemaTypes['input']['custom']['filter']; // { name?: string, color?: string }

// Demonstrate accessing schemas for runtime validation
export const validateLabelAssignment = (data: unknown) => {
    const schemas: LabelSchemaTypes['schemas'] = labelSchemas.inputSchemas;
    return schemas.custom.assignment.parse(data);
};
