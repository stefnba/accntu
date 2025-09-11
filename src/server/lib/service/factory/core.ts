import { InferServiceSchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { QueryBuilder } from '@/server/lib/db/query/builder';
import { QueryFn } from '@/server/lib/db/query/builder/types';
import { ServiceFn } from '@/server/lib/service/factory/types';

class FeatureServices<
    const TSchemas extends Record<string, TOperationSchemaObject> = Record<
        string,
        TOperationSchemaObject
    >,
    const TQuery extends QueryBuilder['queries'] = QueryBuilder['queries'],
> {
    schemas: TSchemas;
    queries: TQuery;

    constructor({ schemas, queries }: { schemas: TSchemas; queries: TQuery }) {
        this.schemas = schemas;
        this.queries = queries;
    }

    /**
     * Register a schema to the feature query collection.
     * @param schemas - The schemas to register
     */
    registerSchema<T extends Record<string, TOperationSchemaObject>>(schemas: T) {
        return new FeatureServices<TSchemas & T, TQuery>({
            schemas: {
                ...this.schemas,
                ...schemas,
            },
            queries: this.queries,
        });
    }

    registerQuery<T extends Record<string, QueryFn>>(
        queries: T
    ): FeatureServices<TSchemas, TQuery & T>;
    registerQuery<
        T extends QueryBuilder<Record<string, TOperationSchemaObject>, Record<string, QueryFn>>,
    >(queryBuilder: T): FeatureServices<TSchemas, TQuery & T['queries']>;
    /**
     * Register a query to the feature query collection.
     * @param queryBuilderOrQueries - The query builder or record of queries to register
     * @returns A new FeatureServices with the registered queries
     */
    registerQuery<
        T extends
            | Record<string, QueryFn>
            | QueryBuilder<Record<string, TOperationSchemaObject>, Record<string, QueryFn>>,
    >(queryBuilderOrQueries: T) {
        // Extract queries if it's a QueryBuilder instance, otherwise use as-is
        const queries =
            queryBuilderOrQueries &&
            typeof queryBuilderOrQueries === 'object' &&
            'queries' in queryBuilderOrQueries
                ? queryBuilderOrQueries.queries
                : queryBuilderOrQueries;

        return new FeatureServices({
            schemas: this.schemas,
            queries: {
                ...this.queries,
                ...queries,
            },
        });
    }

    /**
     * Define service collection for the feature service collection.
     */
    defineServices<
        const K extends keyof TSchemas | (string & {}),
        R extends {
            [Key in K]?: ServiceFn<
                Key extends keyof InferServiceSchemas<TSchemas>
                    ? InferServiceSchemas<TSchemas>[Key]
                    : never,
                unknown
            >;
        },
    >(fn: (input: { queries: TQuery; schemas: TSchemas }) => R) {
        return fn({ queries: this.queries, schemas: this.schemas });
    }
}

/**
 * Factory function to create a feature service collection.
 */
export const createFeatureServices = new FeatureServices({
    schemas: {},
    queries: {},
});
