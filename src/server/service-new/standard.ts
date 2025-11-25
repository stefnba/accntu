import { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';
import { serviceHandler } from '@/server/service-new/handler';
import { Table } from 'drizzle-orm';
import { ServiceFn, TEmptyServices } from './types';

/**
 * StandardServiceBuilder - Builder for standard CRUD service operations.
 *
 * Follows the same pattern as StandardSchemasBuilder from schemas_new:
 * - Uses `const TQueries` to preserve exact types (no constraint that would narrow)
 * - Each method extracts types from TQueries and creates a service
 * - Types flow naturally through method chaining
 *
 * @template TTable - Drizzle table type
 * @template TConfig - Feature table config type
 * @template TTableConfig - Full table config instance type
 * @template TQueries - Exact queries record type (const preserves types)
 * @template TServices - Accumulated services record type
 */
export class StandardServiceBuilder<
    TTable extends Table,
    TConfig extends TFeatureTableConfig<TTable>,
    TTableConfig extends FeatureTableConfig<TTable, TConfig>,
    const TQueries extends Record<string, QueryFn>,
    const TServices extends Record<string, ServiceFn> = TEmptyServices,
> {
    tableConfig: TTableConfig;
    /** Queries stored with their exact type TQueries, not a lookup type */
    queries: TQueries;
    /** Services stored with their exact type TServices, not a lookup type */
    services: TServices;

    constructor({
        tableConfig,
        queries,
        services,
    }: {
        tableConfig: TTableConfig;
        queries: TQueries;
        services: TServices;
    }) {
        this.tableConfig = tableConfig;
        this.queries = queries;
        this.services = services;
    }

    static create<
        const TTable extends Table,
        const TConfig extends TFeatureTableConfig<TTable>,
        const TQueriesNew extends Record<string, QueryFn>,
    >(tableConfig: FeatureTableConfig<TTable, TConfig>, queries: TQueriesNew) {
        return new StandardServiceBuilder<
            TTable,
            TConfig,
            FeatureTableConfig<TTable, TConfig>,
            TQueriesNew
        >({
            tableConfig,
            queries,
            services: {},
        });
    }

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
        const operation = 'create';
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: false,
            operation,
        });

        return new StandardServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            TQueries,
            TServices & { create: typeof wrappedService }
        >({
            tableConfig: this.tableConfig,
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
        const operation = 'createMany';
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: false,
            operation,
        });

        return new StandardServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            TQueries,
            TServices & { createMany: typeof wrappedService }
        >({
            tableConfig: this.tableConfig,
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
        const operation = 'getMany';
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: false,
            operation,
        });

        return new StandardServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            TQueries,
            TServices & { getMany: typeof wrappedService }
        >({
            tableConfig: this.tableConfig,
            queries: this.queries,
            services: { ...this.services, getMany: wrappedService },
        });
    }

    /**
     * Adds standard updateById service.
     *
     * Wraps the 'updateById' query with standard error handling.
     * Returns nullable type (returns null if ID not found to update).
     */
    updateById() {
        const operation = 'updateById';
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: false,
            operation,
        });

        return new StandardServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            TQueries,
            TServices & { updateById: typeof wrappedService }
        >({
            tableConfig: this.tableConfig,
            queries: this.queries,
            services: { ...this.services, updateById: wrappedService },
        });
    }

    /**
     * Adds standard removeById service.
     *
     * Wraps the 'removeById' query with standard error handling.
     * Returns nullable type (returns null if ID not found to remove).
     */
    removeById() {
        const operation = 'removeById';
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: false,
            operation,
        });

        return new StandardServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            TQueries,
            TServices & { removeById: typeof wrappedService }
        >({
            tableConfig: this.tableConfig,
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
        const operation = 'getById';
        const query = this.getQuery(operation);

        const wrappedService = serviceHandler({
            serviceFn: query,
            throwOnNull: true,
            operation,
        });

        return new StandardServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            TQueries,
            TServices & { getById: typeof wrappedService }
        >({
            tableConfig: this.tableConfig,
            queries: this.queries,
            services: { ...this.services, getById: wrappedService },
        });
    }

    /**
     * Adds all standard services available in the queries object.
     * Currently aliases getById() as a starting point.
     * Ideally should chain all available methods if they exist.
     */
    all() {
        // Chain all standard methods that are available in queries
        // This implementation is simplified; in a real scenario you might check availability
        // or assume standard queries are present if called.
        let builder = this.create();

        // Chain other methods if their queries exist (optional safety check could go here)
        // For now, we assume if you call all(), you have the standard set.
        // However, strictly, we should probably use conditional chaining or just rely on the user
        // to have registered standard queries.

        // Since we can't easily conditionally chain in the type system without more complex types,
        // we will chain them assuming they exist, which matches registerAllStandard behavior.
        if (this.queries['createMany']) builder = builder.createMany();
        if (this.queries['getMany']) builder = builder.getMany();
        if (this.queries['getById']) builder = builder.getById();
        if (this.queries['updateById']) builder = builder.updateById();
        if (this.queries['removeById']) builder = builder.removeById();

        return builder;
    }

    /**
     * Returns the built services object.
     */
    done() {
        return this.services;
    }
}
