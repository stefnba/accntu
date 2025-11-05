/**
 * Service Builder Factory - Entry point for creating type-safe service layers.
 *
 * This factory provides a fluent interface for:
 * 1. Registering operation schemas (for input type inference)
 * 2. Registering database queries (for output type inference)
 * 3. Creating core CRUD services (getById, create, getMany)
 * 4. Building a ServiceBuilder for adding custom services
 *
 * @example
 * ```typescript
 * const services = new ServiceBuilderFactory({ schemas: {}, queries: {} })
 *     .registerSchemas(mySchemas)
 *     .registerQueries(myQueries)
 *     .registerCoreServices()
 *     .addService('custom', ({ queries }) => ({
 *         throwOnNull: true,
 *         fn: async (input) => await queries.custom(input),
 *     }))
 *     .build();
 * ```
 */

import { InferServiceSchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { QueryFn } from '@/server/lib/db/query/builder/feature-query/types';
import { FeatureQueryBuilder } from '@/server/lib/db/query/feature-queries';
import { ServiceBuilder } from '@/server/lib/service/builder/core';
import { ServiceFn } from '@/server/lib/service/builder/types';
import { wrapServiceWithHandler } from '@/server/lib/service/builder/utils';

/**
 * Factory class for initializing the service builder with schemas and queries.
 *
 * The factory uses the builder pattern to enable progressive registration of:
 * - Operation schemas (define expected input/output types)
 * - Query functions (database operations)
 * - Core services (standard CRUD operations)
 *
 * @template TSchemas - Record of operation schemas for type inference
 * @template TQueries - Record of query functions
 */
export class ServiceBuilderFactory<
    const TSchemas extends Record<string, TOperationSchemaObject>,
    const TQueries extends Record<string, QueryFn>,
> {
    /** Registered operation schemas used for input type inference */
    schemas: TSchemas;

    /** Registered query functions that services will wrap */
    queries: TQueries;

    /** The name of the service builder */
    name?: string;

    /**
     * Creates a new ServiceBuilderFactory instance.
     *
     * @param schemas - Initial schemas (typically empty object {})
     * @param queries - Initial queries (typically empty object {})
     */
    constructor({
        schemas,
        queries,
        name,
    }: {
        schemas: TSchemas;
        queries: TQueries;
        name?: string;
    }) {
        this.schemas = schemas;
        this.queries = queries;
        this.name = name;
    }

    /**
     * Registers operation schemas for type inference.
     *
     * Schemas define the expected input/output structure for operations.
     * The builder uses these schemas to infer service input types automatically.
     *
     * @template S - Record of schemas to register
     * @param schemas - Object containing operation schemas (e.g., { getById: {...}, create: {...} })
     * @returns New factory instance with merged schemas and preserved queries
     *
     * @example
     * ```typescript
     * const factory = new ServiceBuilderFactory({ schemas: {}, queries: {} })
     *     .registerSchemas({
     *         getById: { input: z.object({ id: z.string() }), output: z.object({...}) },
     *         create: { input: z.object({ name: z.string() }), output: z.object({...}) },
     *     });
     * ```
     */
    registerSchemas<S extends Record<string, TOperationSchemaObject>>(schemas: S) {
        return new ServiceBuilderFactory<TSchemas & S, TQueries>({
            schemas: {
                ...this.schemas,
                ...schemas,
            },
            queries: this.queries,
            name: this.name,
        });
    }

    /**
     * Registers query functions that services will wrap.
     *
     * Queries are the actual database operations. Services wrap these queries
     * with validation, error handling, and business logic.
     *
     * @template Q - Record of query functions to register
     * @param queries - Object containing query functions (e.g., { getById: fn, create: fn })
     * @returns New factory instance with preserved schemas and merged queries
     *
     * @example
     * ```typescript
     * const factory = new ServiceBuilderFactory({ schemas: {}, queries: {} })
     *     .registerQueries({
     *         getById: async (args) => await db.select()...,
     *         create: async (args) => await db.insert()...,
     *     });
     * ```
     */
    registerQueries<Q extends FeatureQueryBuilder>(queries: Q) {
        return new ServiceBuilderFactory<TSchemas, TQueries & Q['queries']>({
            schemas: this.schemas,
            queries: {
                ...this.queries,
                ...queries.queries,
            },
            name: this.name,
        });
    }

    /**
     * Registers the six core CRUD services and returns a ServiceBuilder.
     *
     * Creates and registers these standard services:
     * - **getById**: Fetch a single record by ID (throws if not found)
     * - **create**: Create a new record (throws on failure)
     * - **createMany**: Create multiple records (throws on failure)
     * - **getMany**: Fetch multiple records (returns empty array `[]`)
     * - **updateById**: Update a record by ID (throws if not found)
     * - **removeById**: Remove a record by ID (throws if not found)
     *
     * After calling this method, you can:
     * - Add custom services via `.addService()`
     * - Build the final services object via `.build()`
     *
     * @returns ServiceBuilder instance with core services registered
     *
     * @example
     * ```typescript
     * const builder = new ServiceBuilderFactory({ schemas: {}, queries: {} })
     *     .registerSchemas(schemas)
     *     .registerQueries(queries)
     *     .registerCoreServices(); // Returns ServiceBuilder
     *
     * // Now you can add custom services or build
     * const services = builder.build();
     *
     * // Use the core services
     * const item = await services.getById({ ids: { id: '123' }, userId: 'user-1' });
     * const newItem = await services.create({ data: {...}, userId: 'user-1' });
     * const items = await services.getMany({ filters: {}, pagination: {...}, userId: 'user-1' });
     * ```
     */
    registerCoreServices() {
        /**
         * Get a record by the given identifiers.
         * Throws an error if the record is not found.
         */
        const getById: ServiceFn<
            InferServiceSchemas<TSchemas>['getById'],
            Awaited<ReturnType<TQueries['getById']>>
        > = async (args) => {
            return await this.queries.getById(args);
        };

        /**
         * Get many records in the table with optional filtering and pagination.
         * Returns an empty array if no records are found.
         */
        const getMany: ServiceFn<
            InferServiceSchemas<TSchemas>['getMany'],
            Awaited<ReturnType<TQueries['getMany']>>
        > = async (args) => {
            return await this.queries.getMany(args);
        };

        /**
         * Create a record in the table.
         * Throws an error if the creation fails.
         */
        const create: ServiceFn<
            Parameters<TQueries['create']>[0],
            Awaited<ReturnType<TQueries['create']>>
        > = async (args) => {
            return await this.queries.create(args);
        };

        /**
         * Create many records in the table.
         * Throws an error if the creation fails.
         */
        const createMany: ServiceFn<
            Parameters<TQueries['createMany']>[0],
            Awaited<ReturnType<TQueries['createMany']>>
        > = async (args) => {
            return await this.queries.createMany(args);
        };

        /**
         * Update a record by the given identifiers.
         * Throws an error if the update fails.
         */
        const updateById: ServiceFn<
            InferServiceSchemas<TSchemas>['updateById'],
            Awaited<ReturnType<TQueries['updateById']>>
        > = async (args) => {
            return await this.queries.updateById(args);
        };

        /**
         * Remove a record by the given identifiers.
         * Throws an error if the removal fails.
         */
        const removeById: ServiceFn<
            InferServiceSchemas<TSchemas>['removeById'],
            Awaited<ReturnType<TQueries['removeById']>>
        > = async (args) => {
            return await this.queries.removeById(args);
        };

        // Wrap core services with appropriate handlers
        const coreServices = {
            getById: wrapServiceWithHandler({
                serviceFn: getById,
                throwOnNull: true,
                operation: 'getById',
                resource: this.name,
            }),
            create: wrapServiceWithHandler({
                serviceFn: create,
                throwOnNull: true,
                operation: 'create',
                resource: this.name,
            }),
            createMany: wrapServiceWithHandler({
                serviceFn: createMany,
                throwOnNull: false,
                operation: 'createMany',
                resource: this.name,
            }),
            getMany: wrapServiceWithHandler({
                serviceFn: getMany,
                throwOnNull: false,
                operation: 'getMany',
                resource: this.name,
            }),
            updateById: wrapServiceWithHandler({
                serviceFn: updateById,
                throwOnNull: true,
                operation: 'updateById',
                resource: this.name,
            }),
            removeById: wrapServiceWithHandler({
                serviceFn: removeById,
                throwOnNull: true,
                operation: 'removeById',
                resource: this.name,
            }),
        };

        // Return a ServiceBuilder instance for adding custom services
        return new ServiceBuilder<TSchemas, typeof coreServices, TQueries>({
            schemas: this.schemas,
            queries: this.queries,
            services: coreServices,
        });
    }

    /**
     * Adds a custom service to the service layer.
     *
     * If we don't call registerCoreServices() first, then we can add a first custom services using this method, which returns a ServiceBuilder instance with the added service.
     *
     * @example
     * ```typescript
     * const builder = new ServiceBuilderFactory({ schemas: {}, queries: {} })
     *     .addService('custom', ({ queries }) => ({
     *         operation: 'custom',
     *         throwOnNull: true,
     *         fn: async (input) => await queries.custom(input),
     *     }));
     * ```
     */
    addService<
        K extends (keyof TSchemas & string) | ({} & string),
        TInput = K extends keyof InferServiceSchemas<TSchemas>
            ? InferServiceSchemas<TSchemas>[K]
            : never,
        TOutput = unknown,
        TThrowOnNull extends boolean = boolean,
    >(
        key: K,
        serviceDefinition: (input: { queries: TQueries; schemas: TSchemas }) => {
            operation?: string;
            throwOnNull?: TThrowOnNull;
            fn: ServiceFn<TInput, TOutput>;
        }
    ) {
        // Execute the service definition to get the configuration
        const definition = serviceDefinition({
            queries: this.queries,
            schemas: this.schemas,
        });

        const { fn, throwOnNull = true, operation } = definition;

        // Wrap the service with the appropriate handler
        const wrappedService: ServiceFn<TInput, TOutput> = throwOnNull
            ? wrapServiceWithHandler({
                  serviceFn: fn,
                  throwOnNull: true,
                  operation: operation || key,
                  resource: this.name,
              })
            : wrapServiceWithHandler({
                  serviceFn: fn,
                  throwOnNull: false,
                  operation: operation || key,
                  resource: this.name,
              });

        // Create a new record of services with the added service
        //
        const services = {} as Record<K, ServiceFn<TInput, TOutput>>;
        services[key] = wrappedService;

        // Return a new builder instance with the added service
        return new ServiceBuilder<TSchemas, Record<K, ServiceFn<TInput, TOutput>>, TQueries>({
            schemas: this.schemas,
            queries: this.queries,
            services,
        });
    }
}

export const createFeatureServices = (name?: string) =>
    new ServiceBuilderFactory({
        schemas: {},
        queries: {},
        name,
    });
