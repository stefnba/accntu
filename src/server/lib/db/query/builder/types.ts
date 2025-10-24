import { InferQuerySchemas, TOperationSchemaObject } from '@/lib/schemas/types';

import { RequiredOnly, TByIdInput } from '@/server/lib/db/query/crud/types';
import { GetColumnData, InferInsertModel, Table } from 'drizzle-orm';
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
 * Unwraps null/undefined from the top level of a type only, preserving nullable fields.
 * This is different from NonNullable which recursively removes null from nested properties.
 *
 * @template T - The type to unwrap
 * @example UnwrapNullable<User | null> // User (with nullable fields preserved)
 */
export type UnwrapNullable<T> = T extends null | undefined ? never : T;

/**
 * Universal type inference for feature entity types.
 * Works with both QueryBuilder instances and query function records.
 * Automatically handles array unwrapping and null unwrapping at the root level only.
 * Preserves nullable fields within the entity (e.g., optional/nullable columns).
 *
 * @template T - The QueryBuilder or query functions record
 * @template TKey - The query key to infer from (defaults to 'getById')
 * @example InferFeatureType<typeof userQueries> // User (with nullable fields preserved)
 * @example InferFeatureType<typeof userQueryBuilder, 'getMany'> // User[]
 */
export type InferFeatureType<
    T extends QueryBuilder,
    TKey extends keyof T['queries'] | (string & {}) = 'getById',
> = T extends QueryBuilder
    ? T extends QueryBuilder<any, infer TQueries>
        ? TKey extends keyof TQueries
            ? UnwrapNullable<InferFeatureTypeFromRecord<TQueries, TKey>>
            : never
        : never
    : T extends Record<string, QueryFn>
      ? TKey extends keyof T
          ? UnwrapNullable<InferFeatureTypeFromRecord<T, TKey>>
          : never
      : never;

// ========================================
// Core Crud Queries
// ========================================

export type TCoreQueries<
    TSchemas extends Record<string, TOperationSchemaObject>,
    T extends Table,
    TIdFields extends Array<keyof T['_']['columns']>,
    TUserIdField extends keyof T['_']['columns'] | undefined = undefined,
    TReturnColumns extends Array<keyof T['_']['columns']> = Array<keyof T['_']['columns']>,
    TAllowedUpsertColumns extends ReadonlyArray<keyof T['$inferInsert']> = ReadonlyArray<
        keyof T['$inferInsert']
    >,
> = {
    /**
     * Create a record in the table
     */
    create: QueryFn<
        {
            data: Pick<InferInsertModel<T>, TAllowedUpsertColumns[number]> &
                (TUserIdField extends keyof T['_']['columns']
                    ? Omit<RequiredOnly<T['$inferInsert']>, TUserIdField>
                    : RequiredOnly<T['$inferInsert']>);
        } & (TUserIdField extends keyof T['_']['columns']
            ? {
                  userId: GetColumnData<T['_']['columns'][TUserIdField]>;
              }
            : object),
        { [K in TReturnColumns[number]]: GetColumnData<T['_']['columns'][K], 'query'> }
    >;
    /**
     * Create many records in the table
     */
    createMany: QueryFn<
        {
            data: Array<
                Pick<InferInsertModel<T>, TAllowedUpsertColumns[number]> &
                    RequiredOnly<T['$inferInsert']>
            >;
        },
        { [K in TReturnColumns[number]]: GetColumnData<T['_']['columns'][K], 'query'> }[]
    >;
    /**
     * Get a record by the given identifiers
     */
    getById: QueryFn<
        TByIdInput<T, TIdFields, TUserIdField>,
        { [K in TReturnColumns[number]]: GetColumnData<T['_']['columns'][K], 'query'> } | null
    >;
    /**
     * Get many records by the given identifiers
     */
    getMany: QueryFn<
        {
            filters?: InferQuerySchemas<TSchemas>['getMany']['filters'];
            limit?: number;
            pagination?: {
                page?: number;
                pageSize?: number;
            };
        } & (TUserIdField extends keyof T['_']['columns']
            ? {
                  userId: GetColumnData<T['_']['columns'][TUserIdField]>;
              }
            : object),
        { [K in TReturnColumns[number]]: GetColumnData<T['_']['columns'][K], 'query'> }[]
    >;
    /**
     * Update a record by the given identifiers
     */
    updateById: QueryFn<
        TByIdInput<T, TIdFields, TUserIdField> & {
            data: Partial<Pick<InferInsertModel<T>, TAllowedUpsertColumns[number]>>;
        },
        { [K in TReturnColumns[number]]: GetColumnData<T['_']['columns'][K], 'query'> }
    >;
    /**
     * Remove a record by the given identifiers
     */
    removeById: QueryFn<
        TByIdInput<T, TIdFields, TUserIdField>,
        { [K in TReturnColumns[number]]: GetColumnData<T['_']['columns'][K], 'query'> }
    >;
};
