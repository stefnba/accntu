import type { TOperationSchemaObject } from '@/lib/schemas/types';
import { QueryFn } from '@/server/lib/db/query/builder/types';
import type { ServicesConfig } from './types';

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
    TQueries extends Record<string, QueryFn>,
    TServices extends ServicesConfig<TSchemas>,
>(config: {
    queries: TQueries;
    schemas: TSchemas;
    services: (input: { schemas: TSchemas; queries: TQueries }) => TServices;
}): TServices => {
    const { queries, schemas, services } = config;
    return services({ schemas, queries });
};

// class TagService<
//     TQueries extends Record<string, string | (() => string)> = Record<
//         string,
//         string | (() => string)
//     >,
// > {
//     queries: TQueries;

//     constructor({ queries }: { queries: TQueries }) {
//         this.queries = queries;
//     }
// }

// const a = new TagService({ queries: { hi: () => 'sss', best: 'sss' } });
// const b = new TagService({ queries: { nein: 'sss', what: 'sss' } });

// // helpers

// /**
//  * Extract the queries from a TagService.
//  */
// type ExtractQueries<T> = T extends TagService ? T['queries'] : never;

// /**
//  * Union to intersection.
//  * For example, if we have a union of objects, we can use this to merge them into a single object.
//  */
// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
//     ? I
//     : never;

// /**
//  * Merge the queries from a TagService.
//  */
// type MergeQueries<T extends Record<string, TagService>> = UnionToIntersection<
//     ExtractQueries<T[keyof T]>
// >;

// function combineServices<T extends Record<string, TagService>>(services: T): MergeQueries<T> {
//     return Object.assign({}, ...Object.values(services).map((s) => s.queries));
// }

// const aaaa = combineServices({ a, b });

// aaaa.hi();
