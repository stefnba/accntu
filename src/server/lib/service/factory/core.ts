import type { QueriesConfig, ServiceHandlerResult, ServicesConfig } from './types';

/**
 * Creates a service collection with automatic type inference from schemas and queries.
 *
 * Features:
 * - Auto-infers service input types from serviceSchemas when keys match
 * - Falls back to query parameter types or allows custom types when no schema exists
 * - Supports both query-derived and custom services
 * - Full TypeScript intellisense and type safety
 *
 * @example
 * ```typescript
 * const userServices = createFeatureServices({
 *   queries: userQueries,
 *   schemas: userSchemas,
 *   services: ({ queries, schemas }) => ({
 *     // Auto-typed from userSchemas.serviceSchemas.create
 *     create: async (input) => queries.create({ ...input, userId: '1' }),
 *     // Custom service with any input type
 *     processUser: async ({ userId, action }) => ({ userId, action, processed: true })
 *   })
 * });
 * ```
 */
export const createFeatureServices = <
    TSchemas extends Record<string, unknown>,
    TQueries extends QueriesConfig,
    TServices extends ServicesConfig<TQueries, TSchemas>,
>({
    queries,
    schemas,
    services,
}: {
    queries: TQueries;
    schemas: TSchemas;
    services: (input: { schemas: TSchemas; queries: TQueries }) => TServices;
}): ServiceHandlerResult<TQueries, TServices> => {
    return services({ schemas, queries });
};
