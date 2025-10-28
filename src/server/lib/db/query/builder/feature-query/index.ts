/**
 * Feature Query Builder - Modern query builder exports
 *
 * See README.md in this directory for documentation
 */

export { FeatureQueryBuilder } from './core';
export { createFeatureQueries } from './factory';
export { StandardQueryBuilder } from './standard/builder';

export type {
    GetCustomColumnKeys,
    GetCustomInsertKeys,
    ResolveDefaultAllowedColumns,
    ResolveDefaultReturnColumns,
    TCreateQueryOptions,
    TGetByIdQueryOptions,
    TStandardQueryConfig,
    TStandardQueryConfigDefaults,
    TUpdateByIdQueryOptions,
} from './standard/types';
