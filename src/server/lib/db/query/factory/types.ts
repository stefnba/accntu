import { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm';

// ================================
// Input types for core CRUD operations
// ================================
/**
 * Create input type
 */
export type CreateInput<T extends Table> = {
    data: Omit<InferInsertModel<T>, 'id' | 'userId'>;
    userId: string;
};

/**
 * Get by id input type
 */
export type GetByIdInput<T extends Table> = { id: Required<InferSelectModel<T>>['id'] };

/**
 * Update input type
 */
export type UpdateByIdInput<T extends Table> = {
    id: Required<InferSelectModel<T>>['id'];
    data: Partial<Omit<InferInsertModel<T>, 'id' | 'userId'>>;
};

/**
 * Remove by id input type
 */
export type RemoveByIdInput<T extends Table> = {
    id: Required<InferSelectModel<T>>['id'];
};

/**
 * Get many input type
 */
export type GetManyInput<T extends Table> = any;
// ================================
// Core operations
// ================================

/**
 * Standard CRUD operations
 */
export type CoreOperations<T extends Table> = {
    create?: QueryConfigObject<CreateInput<T>>;
    getById?: QueryConfigObject<GetByIdInput<T>>;
    updateById?: QueryConfigObject<UpdateByIdInput<T>>;
    removeById?: QueryConfigObject<RemoveByIdInput<T>>;
    getMany?: QueryConfigObject<GetManyInput<T>>;
};

/**
 * Custom operations can be any string key
 */
export type CustomOperations = Record<string, QueryConfigObject<any, any>>;

/**
 * Combined queries config with standard operations + custom keys
 */
export type QueriesConfig<T extends Table> = CoreOperations<T> & CustomOperations;

/**
 * Extract the query functions from the query config object
 */
export type ExtractQueryFns<T extends Table, C extends QueriesConfig<T>> = {
    [K in keyof C]: C[K]['fn'];
};

/**
 * The function signature of the query function
 */
export type QueryFn<Input = unknown, Output = unknown> = (args: Input) => Promise<Output>;

export type QueryConfigObject<Input = unknown, Output = unknown> = {
    fn: QueryFn<Input, Output>;
    operation: string;
};

/**
 * Query handler with table support
 */
export type QueryHandlerResult<T extends Table, C extends QueriesConfig<T>> = ExtractQueryFns<T, C>;
