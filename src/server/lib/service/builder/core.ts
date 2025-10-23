import { InferServiceSchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { QueryFn } from '@/server/lib/db/query/builder/types';
import { wrapServiceWithHandler } from '@/server/lib/service/builder/utils';
import { ServiceFn } from '@/server/lib/service/factory/types';

export class ServiceBuilder<
    const TSchemas extends Record<string, TOperationSchemaObject>,
    const TServices extends Record<string, ServiceFn<any, any>>,
    const TQueries extends Record<string, QueryFn>,
> {
    schemas: TSchemas;
    services: TServices;
    queries: TQueries;

    constructor({
        schemas,
        services,
        queries,
    }: {
        schemas: TSchemas;
        services: TServices;
        queries: TQueries;
    }) {
        this.schemas = schemas;
        this.services = services;
        this.queries = queries;
    }

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
            returnHandler: 'nonNull';
            serviceFn: ServiceFn<TInput, TOutput>;
        }
    ): ServiceBuilder<
        TSchemas,
        TServices & Record<K, ServiceFn<TInput, NonNullable<TOutput>>>,
        TQueries
    >;
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
            serviceFn: ServiceFn<TInput, TOutput>;
        }
    ): ServiceBuilder<TSchemas, TServices & Record<K, ServiceFn<TInput, TOutput | null>>, TQueries>;
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
            serviceFn: ServiceFn<TInput, TOutput>;
        }
    ): ServiceBuilder<TSchemas, TServices & Record<K, ServiceFn<TInput, TOutput>>, TQueries> {
        const definition = serviceDefinition({
            queries: this.queries,
            schemas: this.schemas,
            services: this.services,
        });

        const { serviceFn, returnHandler = 'nonNull', operation } = definition;

        const wrappedService =
            returnHandler === 'nonNull'
                ? wrapServiceWithHandler(serviceFn, 'nonNull', operation)
                : wrapServiceWithHandler(serviceFn, 'nullable', operation);

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

    build(): TServices {
        return this.services;
    }
}
