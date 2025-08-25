import { typedKeys } from '@/lib/utils';
import { db } from '@/server/db';
import { tag, tagToTransaction } from '@/server/db/schemas';
import { queryFnHandler } from '@/server/lib/db/query/handler/core';
import { Table } from 'drizzle-orm';
import type { ExtractQueryFns, QueriesConfig, QueryHandlerResult } from './types';

/**
 * Create a query collection for a given table and query objects.
 * Both core CRUD queries but also custom queries can be added.
 * @param table - The table to create the query collection for
 * @param config - The config for the query collection
 * @returns The query collection
 */
function createQueryCollection<T extends Table, C extends QueriesConfig<T>>(
    table: T,
    config: C
): QueryHandlerResult<T, C> {
    const queries = {} as ExtractQueryFns<T, C>;

    typedKeys(config).forEach((key) => {
        const queryConfig = config[key];
        // const fn = queryConfig.fn;

        // queries[key] = (params: Parameters<typeof fn>[0]) => {
        //     console.log(queryConfig.operation, key);
        //     return fn(params);
        // };
        queries[key] = queryFnHandler(table, queryConfig.fn, queryConfig.operation, key);
    });

    return queries;
}

// ================================
// Usage
// ================================

const tagQueries = createQueryCollection(tag, {
    // Standard CRUD operations with proper typing
    create: {
        fn: async ({ data, userId }) => {
            const { name } = data;
            const re = await db.insert(tag).values({ name, userId }).returning();
            return re[0];
        },
        operation: 'create',
    },
    getById: {
        fn: ({ id }) => Promise.resolve({ id, name: 'example' }),
        operation: 'read',
    },
    updateById: {
        fn: ({ id, data }) => Promise.resolve({ id, name: data.name || 'updated' }),
        operation: 'update',
    },
    removeById: {
        fn: ({ id }) => Promise.resolve({ id }),
        operation: 'delete',
    },
    custom: {
        fn: ({ success }: { success: boolean }) => Promise.resolve({ success }),
        operation: 'custom',
    },
    getMany: {
        fn: async () => {
            return db.query.tag.findMany();
        },
        operation: 'getMany',
    },
});

// Full type safety - these all work with proper IntelliSense:

// Standard CRUD operations - now with object args!
// const createResult = await queries.create({ data: { name: 'New Item' }, userId: '1' });
const getByIdResult = await tagQueries.getById({ id: '1' });
const updateResult = await tagQueries.updateById({ id: '1', data: { name: 'Updated' } });
const customResult = await tagQueries.custom({ success: true });
const getManyResult = await tagQueries.getMany();

// Custom operations
// const findResult = await queries.findByName('search'); // Type: Array<{ id: number, name: string }>
// const deleteResult = await queries.deleteMany([1, 2, 3]); // Type: { deleted: number }

// Verify types
// console.log(createResult.transactionCount); // ✅ TypeScript knows this is number
console.log(getByIdResult.name); // ✅ TypeScript knows this is string
console.log(updateResult.name); // ✅ TypeScript knows this is string
console.log(customResult.success); // ✅ TypeScript knows this is boolean
console.log(getManyResult); // ✅ TypeScript knows this is boolean
// console.log(findResult[0].id); // ✅ TypeScript knows this is number
// console.log(deleteResult.deleted); // ✅ TypeScript knows this is number

const tagToTransactionQueries = createQueryCollection(tagToTransaction, {
    create: {
        fn: async ({ data, userId }) => {
            const { transactionId, tagId } = data;
            const re = await db
                .insert(tagToTransaction)
                .values({ transactionId, tagId })
                .returning();
            return re[0];
        },
        operation: 'create',
    },
});

const tagToTransactionResult = await tagToTransactionQueries.create({
    data: { transactionId: '1', tagId: '1' },
    userId: '1',
});

console.log(tagToTransactionResult);
