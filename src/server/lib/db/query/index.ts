// Legacy API (deprecated - use builder/feature-query instead)
export { createFeatureQueries } from './feature-queries';
export type { QueryFn } from './feature-queries/types';

// New API (recommended)
export { createFeatureQueries as createFeatureQueryBuilder } from './feature-queries';

// Query handlers
export { dbQueryFnHandler, withDbQuery } from './handler';
