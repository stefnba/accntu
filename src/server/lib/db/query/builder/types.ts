import { QueryBuilder } from './core';

/**
 * Standard function signature for all database query functions.
 * All query functions must be async and return a Promise.
 * 
 * @template Input - The input parameter type (defaults to any for flexibility)
 * @template Output - The return type (defaults to any for flexibility)
 */
export type QueryFn<Input = any, Output = any> = (args: Input) => Promise<Output>;

/**
 * Infer the feature entity type from a QueryBuilder instance.
 * Extracts the return type from a specific query, handling both single items and arrays.
 * 
 * @template TQueryBuilder - The QueryBuilder instance type
 * @template TKey - The query key to infer from (defaults to 'getById')
 * @example InferFeatureTypeFromQueryBuilder<typeof userQueries, 'getById'> // User
 */
export type InferFeatureTypeFromQueryBuilder<
    TQueryBuilder extends QueryBuilder<any, any>,
    TKey extends keyof TQueryBuilder['queries'] = 'getById',
> =
    TQueryBuilder['queries'][TKey] extends QueryFn<any, infer TReturn>
        ? TReturn extends (infer U)[]
            ? U
            : TReturn
        : never;

/**
 * Infer the feature entity type from a query functions record.
 * Extracts the return type from a specific query, handling both single items and arrays.
 * 
 * @template TRecord - The query functions record type
 * @template TKey - The query key to infer from (defaults to 'getById')
 * @example InferFeatureTypeFromRecord<typeof userQueries, 'getById'> // User
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
 * Universal type inference for feature entity types.
 * Works with both QueryBuilder instances and query function records.
 * Automatically handles array unwrapping to get the base entity type.
 * 
 * @template T - The QueryBuilder or query functions record
 * @template TKey - The query key to infer from (defaults to 'getById')
 * @example InferFeatureType<typeof userQueries> // User
 * @example InferFeatureType<typeof userQueryBuilder, 'getMany'> // User
 */
export type InferFeatureType<T, TKey extends string = 'getById'> = T extends QueryBuilder
    ? T extends QueryBuilder<any, infer TQueries>
        ? TKey extends keyof TQueries
            ? InferFeatureTypeFromRecord<TQueries, TKey>
            : never
        : never
    : T extends Record<string, QueryFn>
      ? TKey extends keyof T
          ? InferFeatureTypeFromRecord<T, TKey>
          : never
      : never;
