import { labelQueriesTest } from '@/features/label/server/db/queries';
import { label } from '@/features/label/server/db/schema';
import { TCustomQueries } from '@/server/lib/db/query/factory/types';
import { Table } from 'drizzle-orm';
import { BuildSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * 🏭 **Feature Schema Factory** - Create type-safe, three-layer input validation schemas
 *
 * This factory generates a comprehensive schema system that provides:
 * - **Return Types**: Inferred from actual database query functions (what your API returns)
 * - **Input Types**: Generated from Zod schemas in three progressive layers (what your API accepts)
 * - **Runtime Validation**: Direct access to Zod schemas for `.parse()` operations
 * - **Type Safety**: Schema keys constrained to actual query method names
 *
 * ## Architecture Overview
 *
 * ```
 * ┌─── Return Types (Database) ────┐    ┌─── Input Types (Validation) ──────────────┐
 * │  Query Functions → API Results │    │  Base Schema → Query → Service → Custom   │
 * └────────────────────────────────┘    └───────────────────────────────────────────┘
 * ```
 *
 * ## Three-Layer Input Schema Composition
 *
 * 1. **Query Layer**: WHERE conditions, filters, field selection parameters
 * 2. **Service Layer**: CRUD operation payloads (create, update, delete)
 * 3. **Custom Layer**: Feature-specific schemas (assignments, bulk operations, etc.)
 *
 * @template TFeature - Literal feature name (e.g., "user", "label", "transaction")
 * @template TQueries - Query object from createFeatureQueries() with typed methods
 * @template TTable - Drizzle table definition for base schema generation
 * @template TQuerySchemas - Return type of query schema function
 * @template TServiceSchemas - Return type of service schema function
 * @template TCustomSchemas - Return type of custom schema function
 *
 * @param config - Configuration object with feature metadata and schema functions
 * @param config.feature - Literal feature name (preserved as literal type)
 * @param config.queries - Query object containing all database query methods
 * @param config.table - Drizzle table definition for generating base Zod schema
 * @param config.inputSchemas - Three-layer schema transformation functions
 * @param config.inputSchemas.query - Transform base schema into query-specific schemas
 * @param config.inputSchemas.service - Transform query schemas into service operation schemas
 * @param config.inputSchemas.custom - Create custom schemas using all previous layers
 *
 * @returns Schema result object with inputSchemas, queries, and feature name
 *
 * @example
 * ```typescript
 * // 1. Create feature schemas with three-layer composition
 * const userSchemas = createFeatureSchemas({
 *     feature: 'user',                    // Literal type preserved
 *     table: userTable,                   // Drizzle table definition
 *     queries: userQueries,               // Query methods: { getAll, getById, create, update, ... }
 *     inputSchemas: {
 *         // Query layer: Input validation for database queries
 *         query: (baseSchema) => ({
 *             getAll: baseSchema.pick({ id: true, email: true, name: true }),
 *             search: baseSchema.pick({ email: true, name: true }).partial(),
 *             getById: baseSchema.pick({ id: true }),
 *         }),
 *
 *         // Service layer: CRUD operation inputs
 *         service: (querySchemas) => ({
 *             create: querySchemas.getAll.omit({ id: true }),
 *             update: querySchemas.getAll.partial().required({ id: true }),
 *             delete: querySchemas.getById,
 *         }),
 *
 *         // Custom layer: Feature-specific operations
 *         custom: ({ baseSchema, querySchemas, serviceSchemas }) => ({
 *             resetPassword: z.object({
 *                 email: z.string().email(),
 *                 newPassword: z.string().min(8),
 *             }),
 *             bulkUpdate: z.object({
 *                 users: z.array(serviceSchemas.update),
 *                 reason: z.string().optional(),
 *             }),
 *             searchFilters: querySchemas.search.extend({
 *                 role: z.enum(['admin', 'user']).optional(),
 *                 active: z.boolean().optional(),
 *             }),
 *         }),
 *     },
 * });
 *
 * // 2. Extract all types using the comprehensive type helper
 * type UserTypes = InferSchemaTypes<typeof userSchemas>;
 *
 * // 3. Use return types (from actual database query results)
 * type UserList = UserTypes['return']['getAll'];      // What getAll() actually returns
 * type SingleUser = UserTypes['return']['getById'];   // What getById() actually returns
 * type CreatedUser = UserTypes['return']['create'];   // What create() actually returns
 *
 * // 4. Use input types (for request validation)
 * type CreateUserInput = UserTypes['input']['service']['create'];     // Zod validation type
 * type SearchInput = UserTypes['input']['query']['search'];           // Query filter type
 * type BulkUpdateInput = UserTypes['input']['custom']['bulkUpdate'];  // Custom operation type
 *
 * // 5. Runtime validation with type safety
 * const validateCreateUser = (data: unknown): CreateUserInput => {
 *     return userSchemas.inputSchemas.service.create.parse(data);
 * };
 *
 * const validateSearchParams = (params: unknown): SearchInput => {
 *     return userSchemas.inputSchemas.query.search.parse(params);
 * };
 *
 * // 6. Extract common select patterns
 * type UserSelectTypes = InferSelectReturnTypes<typeof userSchemas>;
 * type UserArray = UserSelectTypes['many'];  // getAll return type
 * type SingleUserItem = UserSelectTypes['one']; // getById return type
 * ```
 *
 * ## Key Benefits
 *
 * - **🔒 Type Safety**: Schema keys are constrained to actual query method names
 * - **🎯 Dual Type System**: Return types from queries, input types from Zod schemas
 * - **🔄 Progressive Composition**: Each layer builds upon the previous with full type inference
 * - **📝 Literal Features**: Feature names preserved as literal types for discriminated unions
 * - **⚡ Runtime Validation**: Direct access to all Zod schemas for parsing/validation
 * - **🛠️ Zero Manual Types**: Everything inferred automatically from schemas and queries
 * - **🎨 Flexible Patterns**: Support for any combination of query, service, and custom schemas
 *
 * ## Type Constraints
 *
 * Schema keys in the `query` layer are automatically constrained to match the keys in your
 * `queries` object. This prevents typos and ensures consistency:
 *
 * ```typescript
 * // ✅ Valid - 'getAll' exists in userQueries
 * query: (baseSchema) => ({
 *     getAll: baseSchema.pick({ id: true }),
 * })
 *
 * // ❌ TypeScript Error - 'invalidKey' doesn't exist in userQueries
 * query: (baseSchema) => ({
 *     invalidKey: baseSchema,  // Compilation error!
 * })
 * ```
 */
export function createFeatureSchemas<
    TFeature extends string,
    TQueries extends TCustomQueries,
    TTable extends Table,
    TQuerySchemas extends Partial<Record<keyof TQueries, unknown>>,
    TServiceSchemas extends Record<string, unknown>,
    TCustomSchemas extends Record<string, unknown>,
>(config: {
    feature: TFeature;
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
        queries: config.queries,
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

import { InferSchemaTypes, InferSelectReturnTypes } from './types';

// Create the inferred types from labelSchemas
export type LabelSchemaTypes = InferSchemaTypes<typeof labelSchemas>;

// Type tests demonstrating the complete type inference system

// Return types - what queries actually return from database
export type TestReturnGetAll = LabelSchemaTypes['return']['getAll']; // Database query return type
export type TestReturnGetById = LabelSchemaTypes['return']['getById']; // Database query return type
export type TestReturnCreate = LabelSchemaTypes['return']['create']; // Database query return type

// Input types - for Zod validation
export type TestInputServiceCreate = LabelSchemaTypes['input']['service']['create']; // Zod schema type
export type TestInputCustomAssignment = LabelSchemaTypes['input']['custom']['assignment']; // Zod schema type
export type TestInputCustomFilter = LabelSchemaTypes['input']['custom']['filter']; // Zod schema type

// Demonstrate accessing schemas for runtime validation
export const validateLabelAssignment = (data: unknown) => {
    const schemas: LabelSchemaTypes['schemas'] = labelSchemas.inputSchemas;
    return schemas.custom.assignment.parse(data);
};

// ============================================================================
// Select Return Types Helper Examples
// ============================================================================

// Using the select helper with defaults (getAll/getById)
export type LabelSelectTypes = InferSelectReturnTypes<typeof labelSchemas>;

// Using the flexible helper with custom keys
export type LabelCustomSelectTypes = InferSelectReturnTypes<
    typeof labelSchemas,
    'getAllFlattened', // Custom "many" key
    'getById' // Standard "one" key
>;

export type LabelCustomSelectTypes2 = InferSelectReturnTypes<typeof labelSchemas>;

// Type tests for select helpers
export type TestSelectMany = LabelSelectTypes['many']; // Return type of labelQueries.getAll
export type TestSelectOne = LabelSelectTypes['one']; // Return type of labelQueries.getById
export type TestCustomMany = LabelCustomSelectTypes['many']; // Return type of labelQueries.getAllFlattened
