import { QueryBuilder } from './core';

/**
 * The function signature of the query function
 */
export type QueryFn<Input = any, Output = any> = (args: Input) => Promise<Output>;

/**
 * Infer feature type from QueryBuilder. By default, it will infer the type from the getById query.
 */
export type InferFeatureTypeFromQueryBuilder<
    TQueryBuilder extends QueryBuilder<any, any, any>,
    TKey extends keyof TQueryBuilder['queries'] = 'getById',
> =
    TQueryBuilder['queries'][TKey] extends QueryFn<any, infer TReturn>
        ? TReturn extends (infer U)[]
            ? U
            : TReturn
        : never;

/**
 * Infer feature type from query object. By default, it will infer the type from the getById query.
 */
export type InferFeatureTypeFromRecord<
    TRecord extends Record<string, QueryFn>,
    TKey extends keyof TRecord = 'getById',
> =
    TRecord[TKey] extends QueryFn<any, infer TReturn>
        ? TReturn extends (infer U)[]
            ? U
            : TReturn
        : never;

/**
 * Infer feature type from QueryBuilder or Record. By default, it will infer the type from the getById query.
 */
export type InferFeatureType<T, TKey extends string = 'getById'> =
    T extends QueryBuilder<any, any, any>
        ? T extends QueryBuilder<any, any, infer TQueries>
            ? TKey extends keyof TQueries
                ? InferFeatureTypeFromRecord<TQueries, TKey>
                : never
            : never
        : T extends Record<string, QueryFn>
          ? TKey extends keyof T
              ? InferFeatureTypeFromRecord<T, TKey>
              : never
          : never;
