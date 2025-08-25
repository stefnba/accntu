import type { QueryFn } from '@/server/lib/db/query/factory/types';
import { Table, getTableName } from 'drizzle-orm';

/**
 * Wrapper function that adds logging and error handling to a query function
 */
export function queryFnHandler<T extends Table, TInput, TOutput>(
    table: T,
    fn: QueryFn<TInput, TOutput>,
    operation: string,
    key: string | number | symbol
): QueryFn<TInput, TOutput> {
    return async (params: TInput) => {
        console.log('table', getTableName(table));
        console.log(`[${operation.toUpperCase()}] ${String(key)} - Starting`);
        try {
            const result = await fn(params);
            console.log(`[${operation.toUpperCase()}] ${String(key)} - Success`);
            return result;
        } catch (error) {
            console.error(`[${operation.toUpperCase()}] ${String(key)} - Error:`, error);
            throw error; // Re-throw to maintain error handling contract
        }
    };
}
