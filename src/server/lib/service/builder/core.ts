/**
 * Service Builder - Fluent builder for adding custom services to a service layer.
 *
 * This class enables method chaining to progressively add custom services
 * on top of core CRUD services. Each service is wrapped with validation
 * logic based on its return handler type.
 *
 * The builder maintains type safety throughout the chain, ensuring that:
 * - Input types are inferred from schemas
 * - Output types are inferred from query functions
 * - Previously added services are available in subsequent service definitions
 *
 * @example
 * ```typescript
 * const services = builder
 *     .addService('archive', ({ queries }) => ({
 *         returnHandler: 'nonNull',
 *         fn: async (input) => await queries.archive(input),
 *     }))
 *     .addService('restore', ({ queries, services }) => ({
 *         returnHandler: 'nonNull',
 *         fn: async (input) => {
 *             // Can use previously added services
 *             const archived = await services.archive(input);
 *             return await queries.restore({ id: archived.id });
 *         },
 *     }))
 *     .build();
 * ```
 */

import { InferServiceSchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import { ServiceFn } from '@/server/lib/service/builder/types';
import { wrapServiceWithHandler } from '@/server/lib/service/builder/utils';

/**
 * Builder class for adding custom services to a service layer.
 *
 * Maintains immutability by creating new instances with each operation,
 * enabling safe method chaining without side effects.
 *
 * @template TSchemas - Record of operation schemas for input type inference
 * @template TServices - Record of currently registered service functions
 * @template TQueries - Record of available query functions
 */
export class ServiceBuilder<
    const TSchemas extends Record<string, TOperationSchemaObject>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic constraint requires `any` for flexible service function types
    const TServices extends Record<string, ServiceFn<any, any>>,
    const TQueries extends Record<string, QueryFn>,
> {
    /** Registered operation schemas used for input type inference */
    schemas: TSchemas;

    /** Currently registered service functions (includes core + custom services) */
    services: TServices;

    /** Available query functions that services can wrap */
    queries: TQueries;

    /** The name of the service builder */
    name?: string;

    /**
     * Creates a new ServiceBuilder instance.
     *
     * Typically called by ServiceBuilderFactory.registerCoreServices()
     * rather than directly by user code.
     *
     * @param schemas - Operation schemas for type inference
     * @param services - Initial services (typically core CRUD services)
     * @param queries - Query functions available to services
     */
    constructor({
        schemas,
        services,
        queries,
        name,
    }: {
        schemas: TSchemas;
        services: TServices;
        queries: TQueries;
        name?: string;
    }) {
        this.schemas = schemas;
        this.services = services;
        this.queries = queries;
        this.name = name;
    }

    /**
     * Adds a custom service with a nonNull return handler.
     *
     * Creates a new service that wraps a query or implements custom business logic.
     * The service is automatically wrapped to throw an error if it returns null/undefined.
     *
     * @template K - Service key (must match a key in TSchemas)
     * @template TOutput - Raw output type of the service
     * @template TInput - Input type (automatically inferred from schema)
     *
     * @param key - Unique identifier for the service (should match schema key)
     * @param serviceDefinition - Function that receives queries/schemas/services and returns service config
     * @returns New ServiceBuilder instance with the added service
     *
     * @example
     * ```typescript
     * .addService('archiveById', ({ queries }) => ({
     *     operation: 'Archive Item',
     *     returnHandler: 'nonNull',
     *     fn: async (input) => {
     *         return await queries.archive(input);
     *     },
     * }))
     * ```
     */
    addService<
        K extends (keyof TSchemas & string) | ({} & string),
        TOutput,
        TInput = K extends keyof InferServiceSchemas<TSchemas>
            ? InferServiceSchemas<TSchemas>[K]
            : never,
    >(
        key: K,
        serviceDefinition: (input: {
            queries: TQueries;
            schemas: TSchemas;
            services: TServices;
        }) => {
            operation?: string;
            returnHandler: 'nonNull';
            fn: ServiceFn<TInput, TOutput>;
        }
    ): ServiceBuilder<
        TSchemas,
        TServices & Record<K, ServiceFn<TInput, NonNullable<TOutput>>>,
        TQueries
    >;

    /**
     * Adds a custom service with a nullable return handler.
     *
     * Creates a new service that can return null/undefined without throwing an error.
     * Useful for optional lookups, searches, or operations that may not find results.
     *
     * @template K - Service key (must match a key in TSchemas)
     * @template TOutput - Raw output type of the service (can include null/undefined)
     * @template TInput - Input type (automatically inferred from schema)
     *
     * @param key - Unique identifier for the service (should match schema key)
     * @param serviceDefinition - Function that receives queries/schemas/services and returns service config
     * @returns New ServiceBuilder instance with the added service
     *
     * @example
     * ```typescript
     * .addService('findByName', ({ queries }) => ({
     *     operation: 'Find Item By Name',
     *     returnHandler: 'nullable',
     *     fn: async (input) => {
     *         // May return null if not found
     *         return await queries.findByName(input);
     *     },
     * }))
     * ```
     */
    addService<
        K extends keyof TSchemas & string,
        TOutput,
        TInput = K extends keyof InferServiceSchemas<TSchemas>
            ? InferServiceSchemas<TSchemas>[K]
            : never,
    >(
        key: K,
        serviceDefinition: (input: {
            queries: TQueries;
            schemas: TSchemas;
            services: TServices;
        }) => {
            operation?: string;
            returnHandler: 'nullable';
            fn: ServiceFn<TInput, TOutput>;
        }
    ): ServiceBuilder<TSchemas, TServices & Record<K, ServiceFn<TInput, TOutput | null>>, TQueries>;

    /**
     * Implementation method for addService (handles both nonNull and nullable cases).
     *
     * This method:
     * 1. Calls the serviceDefinition function with queries, schemas, and services
     * 2. Extracts the fn, returnHandler, and optional operation name
     * 3. Wraps the service with appropriate validation based on returnHandler
     * 4. Creates a new ServiceBuilder instance with the added service
     *
     * @internal
     */
    addService<
        K extends keyof TSchemas & string,
        TOutput,
        TInput = K extends keyof InferServiceSchemas<TSchemas>
            ? InferServiceSchemas<TSchemas>[K]
            : never,
    >(
        key: K,
        serviceDefinition: (input: {
            queries: TQueries;
            schemas: TSchemas;
            services: TServices;
        }) => {
            operation?: string;
            returnHandler: 'nonNull' | 'nullable';
            fn: ServiceFn<TInput, TOutput>;
        }
    ): ServiceBuilder<TSchemas, TServices & Record<K, ServiceFn<TInput, TOutput>>, TQueries> {
        // Execute the service definition to get the configuration
        const definition = serviceDefinition({
            queries: this.queries,
            schemas: this.schemas,
            services: this.services,
        });

        const { fn, returnHandler = 'nonNull', operation } = definition;

        // Wrap the service with the appropriate handler
        const wrappedService =
            returnHandler === 'nonNull'
                ? wrapServiceWithHandler(fn, 'nonNull', {
                      operation: operation || key,
                      resource: this.name,
                  })
                : wrapServiceWithHandler(fn, 'nullable', {
                      operation: operation || key,
                      resource: this.name,
                  });

        // Return a new builder instance with the added service
        return new ServiceBuilder<
            TSchemas,
            TServices & Record<K, ServiceFn<TInput, TOutput>>,
            TQueries
        >({
            schemas: this.schemas,
            queries: this.queries,
            services: {
                ...this.services,
                [key]: wrappedService,
            },
        });
    }

    /**
     * Builds and returns the final services object.
     *
     * This method completes the builder chain and returns the collection
     * of all registered services (core + custom).
     *
     * @returns Record of all services with proper typing
     *
     * @example
     * ```typescript
     * const services = new ServiceBuilderFactory({ schemas: {}, queries: {} })
     *     .registerSchemas(mySchemas)
     *     .registerQueries(myQueries)
     *     .registerCoreServices()
     *     .addService('custom', ...)
     *     .build(); // Returns { getById, create, getMany, custom }
     *
     * // Now use the services
     * const result = await services.custom({...});
     * ```
     */
    build(): TServices {
        return this.services;
    }
}
