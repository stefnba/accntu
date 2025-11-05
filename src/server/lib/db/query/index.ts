// Legacy API (deprecated - use builder/feature-query instead)
export { createFeatureQueries } from './builder/feature-query';
export type { QueryFn } from './builder/feature-query/types';

// New API (recommended)
export { createFeatureQueries as createFeatureQueryBuilder } from './builder/feature-query';

// Query handlers
export { dbQueryFnHandler, withDbQuery } from './handler';
