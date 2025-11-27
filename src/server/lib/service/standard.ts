import { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import { serviceHandler } from '@/server/lib/service/handler';
import { NonNullableService, ServiceFn, TEmptyServices } from './types';

export const standardOperations = [
    'create',
    'createMany',
    'getMany',
    'getById',
    'updateById',
    'removeById',
] as const;

export type TStandardOperations = (typeof standardOperations)[number];

/**
 * Operations that throw an error when the result is null.
 * These will be wrapped with `NonNullableService`.
 */
export type TThrowingOperations = 'getById' | 'updateById';

const getStandardOperationKey = <T extends TStandardOperations>(key: T): T => {
    return key;
};

export type StandardServices<Q extends Record<string, QueryFn>> = {
    [K in keyof Q as K extends TStandardOperations ? K : never]: K extends TThrowingOperations
        ? NonNullableService<Q[K]>
        : Q[K];
};

/**
 * StandardServiceBuilder - Builder for standard CRUD service operations.
 *
 * Follows the same pattern as StandardSchemasBuilder from schemas_new:
 * - Uses `const TQueries` to preserve exact types (no constraint that would narrow)
 * - Each method extracts types from TQueries and creates a service
 * - Types flow naturally through method chaining
 *
 * @template TQueries - Exact queries record type (const preserves types)
 * @template TServices - Accumulated services record type
 */
export class StandardServiceBuilder<
    const TQueries extends Record<string, QueryFn>,
    const TServices extends Record<string, ServiceFn> = TEmptyServices,
> {
    /** Queries stored with their exact type TQueries, not a lookup type */
    queries: TQueries;
    /** Services stored with their exact type TServices, not a lookup type */
    services: TServices;

    constructor({ queries, services }: { queries: TQueries; services: TServices }) {
        this.queries = queries;
        this.services = services;
    }

    /**
     * Creates a new standard service builder.
     *
     * @param queries - The queries.
     * @returns The standard service builder.
     */
    static create<const TQueriesNew extends Record<string, QueryFn>>(queries: TQueriesNew) {
        return new StandardServiceBuilder<TQueriesNew>({
            queries,
            services: {},
        });
    }

    /**
     * Gets a query by key. Required for type safety when chaining standard services.
     *
     * @param key - The key of the query to get.
     * @returns The query function.
     */
    private getQuery<K extends keyof TQueries>(key: K): TQueries[K] {
        if (!this.queries[key]) {
            throw new Error(`Query ${String(key)} not found`);
        }

        return this.queries[key];
    }

    /**
     * Adds standard create service.
     *
     * Wraps the 'create' query with standard error handling.
     * Returns the exact return type of the create query (not stripped of nulls).
     */
    create() {
        const operation = getStandardOperationKey('create');
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: false,
            operation,
        });

        return new StandardServiceBuilder<TQueries, TServices & { create: typeof wrappedService }>({
            queries: this.queries,
            services: { ...this.services, create: wrappedService },
        });
    }

    /**
     * Adds standard createMany service.
     *
     * Wraps the 'createMany' query with standard error handling.
     * Returns the exact return type (array).
     */
    createMany() {
        const operation = getStandardOperationKey('createMany');
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: false,
            operation,
        });

        return new StandardServiceBuilder<
            TQueries,
            TServices & { createMany: typeof wrappedService }
        >({
            queries: this.queries,
            services: { ...this.services, createMany: wrappedService },
        });
    }

    /**
     * Adds standard getMany service.
     *
     * Wraps the 'getMany' query with standard error handling.
     * Returns the exact return type (array).
     */
    getMany() {
        const operation = getStandardOperationKey('getMany');
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: false,
            operation,
        });

        return new StandardServiceBuilder<TQueries, TServices & { getMany: typeof wrappedService }>(
            {
                queries: this.queries,
                services: { ...this.services, getMany: wrappedService },
            }
        );
    }

    /**
     * Adds standard updateById service.
     *
     * Wraps the 'updateById' query with standard error handling AND null checking.
     *
     * @remarks
     * Sets `throwOnNull: true`, so the return type is `NonNullable<Result>`.
     * Throws `RESOURCE.NOT_FOUND` if the query returns null (ID not found).
     */
    updateById() {
        const operation = getStandardOperationKey('updateById');
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: true,
            operation,
        });

        return new StandardServiceBuilder<
            TQueries,
            TServices & { updateById: typeof wrappedService }
        >({
            queries: this.queries,
            services: { ...this.services, updateById: wrappedService },
        });
    }

    /**
     * Adds standard removeById service.
     *
     * Wraps the 'removeById' query with standard error handling.
     * Returns nullable type (returns null if ID not found to remove).
     *
     * @remarks
     * Kept as `throwOnNull: false` because delete operations should be idempotent.
     * If the resource is already gone, the goal is achieved.
     * Returning null allows the controller to decide (204 vs 404).
     */
    removeById() {
        const operation = getStandardOperationKey('removeById');
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: false,
            operation,
        });

        return new StandardServiceBuilder<
            TQueries,
            TServices & { removeById: typeof wrappedService }
        >({
            queries: this.queries,
            services: { ...this.services, removeById: wrappedService },
        });
    }

    /**
     * Adds standard getById service.
     *
     * Wraps the 'getById' query with standard error handling AND null checking.
     *
     * @remarks
     * Sets `throwOnNull: true`, so the return type is `NonNullable<Result>`.
     * Throws `RESOURCE.NOT_FOUND` if the query returns null.
     */
    getById() {
        const operation = getStandardOperationKey('getById');
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: true,
            operation,
        });

        return new StandardServiceBuilder<TQueries, TServices & { getById: typeof wrappedService }>(
            {
                queries: this.queries,
                services: { ...this.services, getById: wrappedService },
            }
        );
    }

    /**
     * Adds all standard services available in the queries object.
     *
     * Dynamically chains the specific methods (create, getById, etc.) for each available query.
     * This ensures we reuse the exact logic and types defined in those methods.
     */
    all(): StandardServiceBuilder<TQueries, TServices & StandardServices<TQueries>> {
        // TypeScript cannot track the evolving type of 'builder' inside a loop.
        // We use 'any' as an implementation detail to allow dynamic chaining.
        // The return type ensures strict type safety for the consumer.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-this-alias
        let builder: any = this;

        for (const operation of standardOperations) {
            if (this.queries[operation]) {
                // Dynamically call the specific method (e.g., .create(), .getById())
                // This reuses the exact logic and configuration defined in those methods.
                builder = builder[operation]();
            }
        }

        return builder;
    }

    /**
     * Returns the built services object.
     */
    done() {
        return this.services;
    }
}
