import { CORE_CRUD_QUERIES_KEYS } from '@/server/lib/db/query/factory/config';
import { FilterCoreCrudQueries, TCoreCrudQueries, TCoreCrudQueryKeys } from './types';

/**
 * Create a feature query object.
 * It ensure correct core CRUD query names and allow custom queries.
 */
export const createFeatureQueryObject = <T extends Partial<TCoreCrudQueries>>(queries: T): T => {
    return queries;
};

/**
 * Check if a key is a core CRUD query key.
 */
const isCoreCrudQueryKey = (key: string): key is TCoreCrudQueryKeys => {
    return CORE_CRUD_QUERIES_KEYS.includes(key as TCoreCrudQueryKeys);
};

/**
 * Filter core CRUD queries from a feature query object.
 */
export const filterCoreCrudQueries = <T extends Partial<TCoreCrudQueries>>(
    queries: T
): FilterCoreCrudQueries<T> => {
    const filtered = Object.entries(queries).reduce((acc, [key, value]) => {
        if (isCoreCrudQueryKey(key)) {
            acc[key] = value;
        }
        return acc;
    }, {} as FilterCoreCrudQueries<T>);

    return filtered;
};
