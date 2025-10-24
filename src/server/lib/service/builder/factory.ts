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
 *         returnHandler: 'nonNull',
 *         serviceFn: async (input) => await queries.custom(input),
 *     }))
 *     .build();
 * ```
 */

import { InferServiceSchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { FeatureQueryBuilder } from '@/server/lib/db/query/feature-queries';
import { QueryFn } from '@/server/lib/db/query/feature-queries/types';
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
     * Registers the three core CRUD services and returns a ServiceBuilder.
     *
     * Creates and registers these standard services:
     * - **getById**: Fetch a single record by ID (nonNull handler - throws if not found)
     * - **create**: Create a new record (nonNull handler - throws on failure)
     * - **getMany**: Fetch multiple records with filtering/pagination (nullable handler)
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
         * Returns null if no records are found (nullable handler).
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
            InferServiceSchemas<TSchemas>['create'],
            Awaited<ReturnType<TQueries['create']>>
        > = async (args) => {
            return await this.queries.create(args);
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
            getById: wrapServiceWithHandler(getById, 'nonNull', {
                operation: 'getById',
                resource: this.name,
            }),
            create: wrapServiceWithHandler(create, 'nonNull', {
                operation: 'create',
                resource: this.name,
            }),
            getMany: wrapServiceWithHandler(getMany, 'nullable', {
                operation: 'getMany',
                resource: this.name,
            }),
            updateById: wrapServiceWithHandler(updateById, 'nonNull', {
                operation: 'updateById',
                resource: this.name,
            }),
            removeById: wrapServiceWithHandler(removeById, 'nonNull', {
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
}

export const createServiceBuilder = (name?: string) =>
    new ServiceBuilderFactory({
        schemas: {},
        queries: {},
        name,
    });
