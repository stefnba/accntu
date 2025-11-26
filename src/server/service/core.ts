import { TFeatureSchemas } from '@/lib/schemas_new/types';
import { QueryFn, TEmptyQueries } from '@/server/lib/db/query/feature-queries/types';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';
import { serviceHandler } from '@/server/service/handler';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';
import { StandardServiceBuilder } from './standard';
import { NonNullableService, ServiceFn, TEmptyServices } from './types';

/**
 * Builder for feature-based service operations.
 *
 * @template TTable - Drizzle table type
 * @template TConfig - Feature table config type
 * @template TTableConfig - Full table config instance type
 * @template TQueries - Exact queries record type
 * @template TServices - Accumulated services record type
 * @template TSchemas - Registered schemas type
 */
export class FeatureServiceBuilder<
    const TTable extends Table,
    const TConfig extends TFeatureTableConfig<TTable>,
    const TTableConfig extends FeatureTableConfig<TTable, TConfig> = FeatureTableConfig<
        TTable,
        TConfig
    >,
    TQueries extends Record<string, QueryFn> = TEmptyQueries,
    TSchemas extends TFeatureSchemas = TFeatureSchemas,
    TServices extends Record<string, ServiceFn> = TEmptyServices,
> {
    /** Collection of registered service functions */
    services: TServices;

    /** Table configuration */
    tableConfig: TTableConfig;

    /** Feature queries - stored with exact type TQueries */
    queries: TQueries;

    /** Registered schemas */
    schemas: TSchemas;

    /** Name for the feature service builder */
    name: string;

    constructor({
        services,
        config,
        queries,
        schemas,
        name,
    }: {
        services: TServices;
        config: TTableConfig;
        queries: TQueries;
        schemas: TSchemas;
        name: string;
    }) {
        this.services = services;
        this.tableConfig = config;
        this.queries = queries;
        this.schemas = schemas;
        this.name = name;
    }

    /**
     * Register feature queries.
     *
     * @param queries - Built queries object (result of FeatureQueryBuilder.build())
     */
    registerQueries<const NewQueries extends Record<string, QueryFn>>(queries: NewQueries) {
        return new FeatureServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            NewQueries,
            TSchemas,
            TServices
        >({
            services: this.services,
            config: this.tableConfig,
            queries,
            schemas: this.schemas,
            name: this.name,
        });
    }

    /**
     * Register feature schemas.
     *
     * @param schemas - Feature schemas object
     */
    registerSchema<const NewSchemas extends TFeatureSchemas>(schemas: NewSchemas) {
        return new FeatureServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            TQueries,
            NewSchemas,
            TServices
        >({
            services: this.services,
            config: this.tableConfig,
            queries: this.queries,
            schemas,
            name: this.name,
        });
    }

    /**
     * Add a custom service function (Non-nullable return by default).
     *
     * @param key - Unique service identifier
     * @param config - Service configuration object or function receiving context
     */
    addService<
        const K extends Exclude<string, keyof TServices> | (string & {}),
        Input = unknown,
        Output = unknown,
    >(
        key: K,
        config: (args: { queries: TQueries; schemas: TSchemas; config: TTableConfig }) => {
            fn: ServiceFn<Input, Output>;
            operation?: string;
            onNull?: 'throw';
        }
    ): FeatureServiceBuilder<
        TTable,
        TConfig,
        TTableConfig,
        TQueries,
        TSchemas,
        TServices & Record<K, NonNullableService<ServiceFn<Input, Output>>>
    >;

    /**
     * Add a custom service function (Nullable return).
     *
     * @param key - Unique service identifier
     * @param config - Service configuration object or function receiving context
     */
    addService<
        const K extends Exclude<string, keyof TServices> | (string & {}),
        Input = unknown,
        Output = unknown,
    >(
        key: K,
        config: (args: { queries: TQueries; schemas: TSchemas; config: TTableConfig }) => {
            fn: ServiceFn<Input, Output>;
            operation?: string;
            onNull: 'return';
        }
    ): FeatureServiceBuilder<
        TTable,
        TConfig,
        TTableConfig,
        TQueries,
        TSchemas,
        TServices & Record<K, ServiceFn<Input, Output>>
    >;

    /**
     * Implementation
     */
    addService<
        const K extends Exclude<string, keyof TServices> | (string & {}),
        Input = unknown,
        Output = unknown,
    >(
        key: K,
        config: (args: { queries: TQueries; schemas: TSchemas; config: TTableConfig }) => {
            fn: ServiceFn<Input, Output>;
            operation?: string;
            onNull?: 'throw' | 'return';
        }
    ): FeatureServiceBuilder<
        TTable,
        TConfig,
        TTableConfig,
        TQueries,
        TSchemas,
        TServices &
            Record<K, ServiceFn<Input, Output> | NonNullableService<ServiceFn<Input, Output>>>
    > {
        const {
            fn,
            operation,
            onNull = 'throw',
        } = config({
            queries: this.queries,
            schemas: this.schemas,
            config: this.tableConfig,
        });

        const wrappedService =
            onNull === 'throw'
                ? serviceHandler<Input, Output, ServiceFn<Input, Output>>({
                      serviceFn: fn,
                      throwOnNull: true,
                      operation: operation || `${String(key)} operation`,
                      resource: this.name,
                  })
                : serviceHandler<Input, Output, ServiceFn<Input, Output>>({
                      serviceFn: fn,
                      throwOnNull: false,
                      operation: operation || `${String(key)} operation`,
                      resource: this.name,
                  });

        return new FeatureServiceBuilder({
            services: { ...this.services, [key]: wrappedService },
            config: this.tableConfig,
            queries: this.queries,
            schemas: this.schemas,
            name: this.name,
        });
    }

    /**
     * Add standard services to the builder.
     *
     * @param standard - Standard service builder function
     */
    withStandard<TBuilder extends StandardServiceBuilder<TTable, TConfig, TTableConfig, TQueries>>(
        standard: (
            b: ReturnType<typeof StandardServiceBuilder.create<TTable, TConfig, TQueries>>
        ) => TBuilder
    ) {
        const builder = StandardServiceBuilder.create<TTable, TConfig, TQueries>(
            this.tableConfig,
            this.queries
        );

        const standardBuilder = standard(builder);
        const standardServices = standardBuilder.done();

        return new FeatureServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            TQueries,
            TSchemas,
            TServices & TBuilder['services']
        >({
            services: { ...this.services, ...standardServices },
            config: this.tableConfig,
            queries: this.queries,
            schemas: this.schemas,
            name: this.name,
        });
    }

    /**
     * Register all standard services to the builder.
     */
    registerAllStandard() {
        const builder = StandardServiceBuilder.create<TTable, TConfig, TQueries>(
            this.tableConfig,
            this.queries
        );

        const standardServices = builder.all().done();

        return new FeatureServiceBuilder<
            TTable,
            TConfig,
            TTableConfig,
            TQueries,
            TSchemas,
            TServices & typeof standardServices
        >({
            services: { ...this.services, ...standardServices },
            config: this.tableConfig,
            queries: this.queries,
            schemas: this.schemas,
            name: this.name,
        });
    }

    /**
     * Finalizes the builder and returns the services object.
     */
    build(): Prettify<TServices> {
        return this.services;
    }
}
