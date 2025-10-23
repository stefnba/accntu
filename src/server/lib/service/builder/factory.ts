import { InferServiceSchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { QueryFn } from '@/server/lib/db/query/builder/types';
import { ServiceBuilder } from '@/server/lib/service/builder/core';
import { wrapServiceWithHandler } from '@/server/lib/service/builder/utils';
import { ServiceFn } from '@/server/lib/service/factory/types';

export class ServiceBuilderFactory<
    const TSchemas extends Record<string, TOperationSchemaObject>,
    const TQueries extends Record<string, QueryFn>,
> {
    schemas: TSchemas;
    queries: TQueries;

    constructor({ schemas, queries }: { schemas: TSchemas; queries: TQueries }) {
        this.schemas = schemas;
        this.queries = queries;
    }

    registerSchemas<S extends Record<string, TOperationSchemaObject>>(schemas: S) {
        return new ServiceBuilderFactory<TSchemas & S, TQueries>({
            schemas: {
                ...this.schemas,
                ...schemas,
            },
            queries: this.queries,
        });
    }

    registerQueries<Q extends Record<string, QueryFn>>(queries: Q) {
        return new ServiceBuilderFactory<TSchemas, TQueries & Q>({
            schemas: this.schemas,
            queries: {
                ...this.queries,
                ...queries,
            },
        });
    }

    registerCoreServices() {
        /**
         * Get a record by the given identifiers
         */
        const getById: ServiceFn<
            InferServiceSchemas<TSchemas>['getById'],
            Awaited<ReturnType<TQueries['getById']>>
        > = async (args) => {
            return await this.queries.getById(args);
        };

        /**
         * Create a record in the table
         */
        const create: ServiceFn<
            InferServiceSchemas<TSchemas>['create'],
            Awaited<ReturnType<TQueries['create']>>
        > = async (args) => {
            return await this.queries.create(args);
        };

        /**
         * Get many records in the table
         */
        const getMany: ServiceFn<
            InferServiceSchemas<TSchemas>['getMany'],
            Awaited<ReturnType<TQueries['getMany']>>
        > = async (args) => {
            return await this.queries.getMany(args);
        };

        const coreServices = {
            getById: wrapServiceWithHandler(getById, 'nonNull', 'getById service'),
            create: wrapServiceWithHandler(create, 'nonNull', 'create service'),
            getMany: wrapServiceWithHandler(getMany, 'nullable', 'getMany service'),
        };

        return new ServiceBuilder<TSchemas, typeof coreServices, TQueries>({
            schemas: this.schemas,
            queries: this.queries,
            services: coreServices,
        });
    }
}
