/**
 * Feature Queries - Feature-level query orchestration.
 *
 * This module provides the FeatureQueryBuilder and factory singleton for building
 * feature-specific database queries with user authentication, filters, and pagination.
 *
 * @example
 * ```typescript
 * import { featureQueryFactory } from '@/server/lib/db/query/feature-queries';
 *
 * export const tagQueries = featureQueryFactory
 *   .registerSchema(tagSchemas)
 *   .registerCoreQueries(tagTable, { userIdField: 'userId', idFields: ['id'] });
 * ```
 */

export { FeatureQueryBuilder } from './core';
export { featureQueryFactory } from './factory';
export type { InferFeatureType, QueryFn, TCoreQueries } from './types';

// Legacy export for backwards compatibility (deprecated)
export { featureQueryFactory as createFeatureQueries } from './factory';
