import { typedKeys } from '@/lib/utils';
import { tag } from '@/server/db/schemas';
import { InferInsertModel, Table } from 'drizzle-orm';

/**
 * Standard CRUD operation types
 */
type CoreOperations<T extends Table> = {
    create?: QueryConfigObject<[Omit<InferInsertModel<T>, 'id' | 'userId'>]>;
    // getById?: QueryConfigObject<[string | number]>;
    updateById?: QueryConfigObject<[Omit<InferInsertModel<T>, 'id' | 'userId'>]>;
};

/**
 * Custom operations can be any string key
 */
type CustomOperations = Record<string, QueryConfigObject<any, any>>;

/**
 * Combined queries config with standard operations + custom keys
 */
type QueriesConfig<T extends Table> = CoreOperations<T> & CustomOperations;

/**
 * Extract the query functions from the query config object
 */
type ExtractQueryFns<T extends Table, C extends QueriesConfig<T>> = {
    [K in keyof C]: C[K]['fn'];
};

/**
 * The function signature of the query function
 */
type QueryFn<Input extends any[], Output = unknown> = (...args: Input) => Promise<Output>;

type QueryConfigObject<Input extends any[], Output = unknown> = {
    fn: QueryFn<Input, Output>;
    operation: string;
};

// ================================

/**
 * Query handler with table support
 */
type QueryHandlerResult<T extends Table, C extends QueriesConfig<T>> = ExtractQueryFns<T, C>;

function createQueryHandler<T extends Table, C extends QueriesConfig<T>>(
    table: T,
    config: C
): QueryHandlerResult<T, C> {
    const queries = {} as ExtractQueryFns<T, C>;

    typedKeys(config).forEach((key) => {
        const queryConfig = config[key];
        console.log(key, queryConfig.operation);
        queries[key] = queryConfig.fn;
    });

    return queries;
}

// ================================
// Usage
// ================================

const queries = createQueryHandler(tag, {
    // Standard CRUD operations with proper typing
    create: {
        fn: (data) => Promise.resolve({ id: 1, name: data.name }),
        operation: 'create',
    },
    updateById: {
        fn: (data) => Promise.resolve({ id: 1, name: data.name }),
        operation: 'update',
    },
    // getById: {
    //     fn: (id: number) => Promise.resolve({ id, name: 'example' }),
    //     operation: 'read',
    // },
    // updateById: {
    //     fn: (id: number, data: { name: string }) => Promise.resolve({ id, name: data.name }),
    //     operation: 'update',
    // },
    // // Custom operations
    // findByName: {
    //     fn: (name: string) => Promise.resolve([{ id: 1, name }]),
    //     operation: 'custom-search',
    // },
    // deleteMany: {
    //     fn: (ids: number[]) => Promise.resolve({ deleted: ids.length }),
    //     operation: 'custom-delete',
    // },
} as const);

// Full type safety - these all work with proper IntelliSense:

// Standard CRUD operations
const createResult = await queries.create({ name: 'New Item' }); // Type: { id: number, name: string }
// const getByIdResult = await queries.getById(1); // Type: { id: number, name: string }
// const updateResult = await queries.updateById(1, { name: 'Updated' }); // Type: { id: number, name: string }

// Custom operations
// const findResult = await queries.findByName('search'); // Type: Array<{ id: number, name: string }>
// const deleteResult = await queries.deleteMany([1, 2, 3]); // Type: { deleted: number }

// Verify types
console.log(createResult.id); // ✅ TypeScript knows this is number
// console.log(getByIdResult.name); // ✅ TypeScript knows this is string
// console.log(updateResult.name); // ✅ TypeScript knows this is string
// console.log(findResult[0].id); // ✅ TypeScript knows this is number
// console.log(deleteResult.deleted); // ✅ TypeScript knows this is number
