import { CommonTableFieldKeys } from '@/server/lib/db/table';
import { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm';
import { CORE_CRUD_QUERIES_KEYS } from './config';

/**
 * Detect if a drizzle table has a specific column.
 * Useful for dynamic input types
 */
export type HasColumn<
    T extends Table,
    ColumnName extends string,
> = ColumnName extends keyof InferSelectModel<T> ? true : false;

/**
 * Include a column in the input type if it exists.
 * Useful for dynamic input types.
 * We must provide the column name and the object to include.
 */
export type IncludeColumn<T extends Table, C extends string, O extends Record<C, any>> =
    HasColumn<T, C> extends true ? O : object;

/**
 * Include userId in the input type if it exists.
 */
type IncludeUserId<T extends Table> = IncludeColumn<
    T,
    'userId',
    { userId: Required<InferSelectModel<T>>['userId'] }
>;

/**
 * Include id in the input type if it exists.
 */
type IncludeId<T extends Table> = IncludeColumn<
    T,
    'id',
    { id: Required<InferSelectModel<T>>['id'] }
>;

// ================================
// Input types for core CRUD operations
// ================================

/**
 * Create
 */
export type CreateInput<T extends Table> = {
    data: Omit<InferInsertModel<T>, CommonTableFieldKeys>;
} & IncludeUserId<T>;

/**
 * Get by id
 */
// export type GetByIdInput<T extends Table> = { id: Required<InferSelectModel<T>>['id'] };
export type GetByIdInput<T extends Table> = IncludeId<T> & IncludeUserId<T>;

/**
 * Update by id
 */
export type UpdateByIdInput<T extends Table> = {
    id: Required<InferSelectModel<T>>['id'];
    data: Partial<Omit<InferInsertModel<T>, CommonTableFieldKeys>>;
} & IncludeUserId<T>;

/**
 * Remove by id
 */
export type RemoveByIdInput<T extends Table> = IncludeId<T> & IncludeUserId<T>;

/**
 * Get many
 */
export type GetManyInput<T extends Table> = any;

// ================================
// Core CRUD operations
// ================================

/**
 * Core CRUD query keys type
 */
export type CoreCrudKey = (typeof CORE_CRUD_QUERIES_KEYS)[number];

/**
 * Input type mapping for core CRUD operations
 */
type CoreInputTypeMap<T extends Table> = {
    // retrieve
    getMany: GetManyInput<T>;
    getById: GetByIdInput<T>;
    // create
    create: CreateInput<T>;
    createMany: { data: Array<Omit<InferInsertModel<T>, CommonTableFieldKeys>>; userId: string };
    // update
    updateById: UpdateByIdInput<T>;
    updateManyByIds: {
        ids: Array<Required<InferSelectModel<T>>['id']>;
        data: Partial<Omit<InferInsertModel<T>, CommonTableFieldKeys>>;
    };
    // soft delete
    removeById: RemoveByIdInput<T>;
    removeManyByIds: { ids: Array<Required<InferSelectModel<T>>['id']> };
    // hard delete
    deleteById: { id: Required<InferSelectModel<T>>['id'] };
    deleteManyByIds: { ids: Array<Required<InferSelectModel<T>>['id']> };
};

/**
 * Standard CRUD operations - dynamically generated from CORE_CRUD_QUERIES_KEYS
 */
export type CoreOperations<T extends Table> = {
    [K in CoreCrudKey]?: QueryConfigObject<CoreInputTypeMap<T>[K]>;
};

// ================================
// Custom operations
// ================================

/**
 * Custom operations can be any string key
 */
export type CustomOperations = Record<string, QueryConfigObject<any, any>>;

// ================================
// Config for the query factory
// ================================

/**
 * Combined queries config with standard operations + custom keys
 */
export type QueriesConfig<T extends Table> = CoreOperations<T> & CustomOperations;

/**
 * The function signature of the query function
 */
export type QueryFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;

/**
 * Query config object for each specific query
 */
export type QueryConfigObject<Input = unknown, Output = unknown> = {
    fn: QueryFn<Input, Output>;
    operation?: string;
};

/**
 * Extract the query functions from the query config object
 */
export type ExtractQueryFns<T extends Table, C extends QueriesConfig<T>> = {
    [K in keyof C]: C[K]['fn'];
};

/**
 * Query handler result
 */
export type QueryHandlerResult<T extends Table, C extends QueriesConfig<T>> = ExtractQueryFns<T, C>;

// ================================
// Infer feature type
// ================================

/**
 * Infer feature type from query handler result. By default, it will infer the type from the getById query.
 */
export type InferFeatureType<
    R extends QueryHandlerResult<Table, QueriesConfig<Table>>,
    Q extends keyof R = 'getById',
> = R[Q] extends (...args: any) => any
    ? Awaited<ReturnType<R[Q]>> extends (infer U)[]
        ? U
        : Awaited<ReturnType<R[Q]>>
    : never;
