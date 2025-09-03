import type { TOperationSchemaObject } from '@/lib/schemas/types';
import type { QueriesConfig, ServicesConfig } from './types';

/**
 * Creates a service collection with automatic type inference from schemas and queries.
 *
 * This factory function provides type-safe service creation with full IntelliSense support
 * for service input parameters based on operation schemas.
 *
 * ## Key Features
 * - **Type-Safe**: Full TypeScript inference for service inputs from schemas
 * - **Zero Runtime Overhead**: Simple passthrough implementation
 * - **Multiple Schema Support**: Use object spread to combine schemas
 * - **No Type Assertions**: Completely safe TypeScript implementation
 *
 * ## Usage Patterns
 *
 * ### Single Schema
 * ```typescript
 * const userServices = createFeatureServices({
 *   queries: userQueries,
 *   schemas: userSchemas,
 *   services: ({ queries }) => ({
 *     create: async ({ data }) => queries.create({ data, userId: getCurrentUserId() }),
 *   })
 * });
 * ```
 *
 * ### Multiple Schemas (Object Spread - RECOMMENDED)
 * ```typescript
 * const tagServices = createFeatureServices({
 *   queries: tagQueries,
 *   schemas: { ...tagSchemas, ...tagToTransactionSchemas },
 *   services: ({ queries }) => ({
 *     // Typed from tagSchemas.create.service
 *     create: async ({ data }) => queries.create({ data, userId: getCurrentUserId() }),
 *     // Typed from tagToTransactionSchemas.assignToTransaction.service
 *     assignToTransaction: async (input) => queries.assignToTransaction({
 *       id: input.idFields.transactionId,
 *       userId: getCurrentUserId(),
 *       tagIds: input.tagIds,
 *     }),
 *   })
 * });
 * ```
 *
 * ## Type Inference
 * Service input parameters are automatically inferred from the `service` layer of
 * operation schemas. For example, if your schema defines:
 * ```typescript
 * create: { service: z.object({ data: z.object({ name: z.string() }) }) }
 * ```
 * Then your service function will receive properly typed input:
 * ```typescript
 * create: async ({ data }) => // data is { name: string }
 * ```
 *
 * @template TSchemas - Schema object containing operation schemas
 * @template TQueries - Query functions object
 * @template TServices - Service functions object with inferred input types
 */
export const createFeatureServices = <
    TSchemas extends Record<string, TOperationSchemaObject>,
    TQueries extends QueriesConfig,
    TServices extends ServicesConfig<TSchemas>,
>(config: {
    queries: TQueries;
    schemas: TSchemas;
    services: (input: { schemas: TSchemas; queries: TQueries }) => TServices;
}): TServices => {
    const { queries, schemas, services } = config;
    return services({ schemas, queries });
};
