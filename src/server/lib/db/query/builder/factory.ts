import { InferQuerySchemas, TOperationSchemaObject } from '@/lib/schemas/types';
import { QueryFn } from '@/server/lib/db/query/builder/types';
import { QueryBuilder } from './core';

class FeatureQueries<
    const TSchemas extends Record<string, TOperationSchemaObject> = Record<
        string,
        TOperationSchemaObject
    >,
> {
    schemas: TSchemas;

    constructor({ schemas }: { schemas: TSchemas }) {
        this.schemas = schemas;
    }

    /**
     * Register a schema to the feature query collection.
     * @param schemas - The schemas to register
     */
    registerSchema<T extends Record<string, TOperationSchemaObject>>(schemas: T) {
        return new FeatureQueries<TSchemas & T>({
            schemas: {
                ...this.schemas,
                ...schemas,
            },
        });
    }

    /**
     * Add a query to the feature query collection. This is a shortcut for adding a query to the QueryBuilder.
     * @param key - The key of the query
     * @param config - The config of the query
     */
    addQuery<
        const K extends keyof TSchemas & string,
        TOutput,
        TInput = K extends keyof InferQuerySchemas<TSchemas>
            ? InferQuerySchemas<TSchemas>[K]
            : never,
    >(key: K, config: { fn: QueryFn<TInput, TOutput>; operation?: string }) {
        return new QueryBuilder<TSchemas>({
            schemas: this.schemas,
            queries: {},
        }).addQuery(key, config);
    }
}

/**
 * Factory function to create a feature query collection.
 */
export const createFeatureQueries = new FeatureQueries({
    schemas: {},
});
