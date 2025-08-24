// ============================================================================
// Core Query
// ============================================================================

import { CORE_CRUD_QUERIES_KEYS } from '@/server/lib/db/query/factory/config';

/**
 * Base type for any feature query function
 */
export type TFeatureQuery = (...args: any[]) => Promise<any>;

/**
 * Extract the return type from a query function (unwraps Promise)
 * - If the return type is an array, it will be unwrapped to the item type
 * - If the return type is an object, it will be returned as is
 * - If the return type is null or undefined, it will be never
 * - If the return type is a primitive, it will be returned as is
 */
export type InferQueryReturn<T extends TFeatureQuery> = T extends (
    ...args: any[]
) => Promise<infer R>
    ? R extends Array<infer AR>
        ? AR
        : R extends object
          ? R
          : R extends null | undefined
            ? never
            : R
    : never;

/**
 * Extract parameter types from a query function
 */
export type InferQueryParams<T extends TFeatureQuery> = T extends (...args: infer P) => any
    ? P[0] // Get first parameter (usually the main params object)
    : never;

// ============================================================================
// Feature Query
// ============================================================================

/**
 * Custom queries are any queries that are not part of the core CRUD queries
 */
export type TCustomQueries = Record<string, TFeatureQuery>;

/**
 * Infer params and return types from feature query object
 * @template T - The feature query object
 * @template K - Optional keys to pick from T (defaults to all keys)
 */
export type InferFeatureQueryTypes<T extends TCustomQueries, K extends keyof T = keyof T> = {
    [Key in K]: T[Key] extends TFeatureQuery
        ? {
              params: InferQueryParams<T[Key]>;
              return: InferQueryReturn<T[Key]>;
          }
        : never;
};

/**
 * Infer return types from feature query object
 * @template T - The feature query object
 * @template K - Optional keys to pick from T (defaults to all keys)
 */
export type InferFeatureQueryReturnTypes<T extends TCustomQueries, K extends keyof T = keyof T> = {
    [Key in K]: InferQueryReturn<T[Key]>;
};

/**
 * Infer param types from feature query object
 * @template T - The feature query object
 * @template K - Optional keys to pick from T (defaults to all keys)
 */
export type InferFeatureQueryParamTypes<T extends TCustomQueries, K extends keyof T = keyof T> = {
    [Key in K]: InferQueryParams<T[Key]>;
};

// ============================================================================
// CRUD Query
// ============================================================================

export type TCoreCrudQueryKeys = (typeof CORE_CRUD_QUERIES_KEYS)[number];
/**
 * Standard CRUD query shape
 */
export type TCoreCrudQueries = Record<TCoreCrudQueryKeys, TFeatureQuery>;

/**
 * Filter type to extract only core CRUD query keys
 */
export type FilterCoreCrudQueries<T> = Pick<T, Extract<keyof T, TCoreCrudQueryKeys>>;

/**
 * Filter type to extract only custom (non-CRUD) query keys
 */
export type FilterCustomQueries<T> = Omit<T, TCoreCrudQueryKeys>;
