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
     * Adds a custom service to the service layer.
     *
     * Configure null-handling behavior with the `throwOnNull` option:
     * - **throwOnNull: true** (default): Service throws an error if it returns null/undefined
     * - **throwOnNull: false**: Service can return null/undefined without error
     *
     * When overriding an existing service (e.g., from registerCoreServices),
     * the new return type completely replaces the old one.
     *
     * @template K - Service key (must match a key in TSchemas)
     * @template TInput - Input type (automatically inferred from schema)
     * @template TOutput - Raw output type of the service
     * @template TThrowOnNull - Whether to throw on null (boolean)
     *
     * @param key - Unique identifier for the service
     * @param serviceDefinition - Function that receives queries/schemas/services and returns service config
     * @returns New ServiceBuilder instance with the added/overridden service
     *
     * @example
     * ```typescript
     * // Throw on null (explicit true)
     * .addService('getById', ({ queries }) => ({
     *     operation: 'Get Item By ID',
     *     throwOnNull: true,
     *     fn: async (input) => await queries.getById(input),
     * }))
     *
     * // Throw on null (default when omitted)
     * .addService('getById', ({ queries }) => ({
     *     operation: 'Get Item By ID',
     *     fn: async (input) => await queries.getById(input),
     * }))
     *
     * // Allow null returns
     * .addService('findByName', ({ queries }) => ({
     *     throwOnNull: false,
     *     fn: async (input) => await queries.findByName(input),
     * }))
     *
     * // Override existing service with new return type
     * .addService('getById', () => ({
     *     throwOnNull: true,
     *     fn: async (input) => ({ customField: 123 }),
     * }))
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
        serviceDefinition: (input: {
            queries: TQueries;
            schemas: TSchemas;
            services: TServices;
        }) => {
            operation?: string;
            throwOnNull?: TThrowOnNull;
            fn: ServiceFn<TInput, TOutput>;
        }
    ) {
        // Execute the service definition to get the configuration
        const definition = serviceDefinition({
            queries: this.queries,
            schemas: this.schemas,
            services: this.services,
        });

        const { fn, throwOnNull = true, operation } = definition;

        // Wrap the service with the appropriate handler
        const wrappedService = throwOnNull
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

        // Return a new builder instance with the added service
        return new ServiceBuilder<
            TSchemas,
            Omit<TServices, K> &
                Record<
                    K,
                    ServiceFn<TInput, TThrowOnNull extends true ? NonNullable<TOutput> : TOutput>
                >,
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
