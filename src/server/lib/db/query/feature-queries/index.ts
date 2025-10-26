/**
 * Feature Queries - Feature-level query orchestration.
 *
 * This module provides the FeatureQueryBuilder and factory for building
 * feature-specific database queries with user authentication, filters, and pagination.
 *
 * @example
 * ```typescript
 * import { createFeatureQueries } from '@/server/lib/db/query/feature-queries';
 *
 * export const tagQueries = createFeatureQueries('tag')
 *   .registerSchema(tagSchemas)
 *   .registerCoreQueries(tagTable, { userIdField: 'userId', idFields: ['id'] });
 * ```
 */

export { FeatureQueryBuilder } from './core';
export { createFeatureQueries } from './factory';
export type { InferFeatureType, QueryFn, TCoreQueries } from './types';
