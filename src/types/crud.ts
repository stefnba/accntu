// ===========================
// Type generics for CRUD operations
// ===========================

type WithUserId = {
    userId: string;
};

/**
 * Update record schema
 */
export type TQueryUpdateRecord<T> = {
    id: string;
    data: Partial<T>;
};

/**
 * Insert record schema
 */
export type TQueryInsertRecord<T> = {
    data: T;
};

/**
 * Select record schema by id and user
 */
export type TQuerySelectRecordById<TFilter extends object | undefined = undefined> = {
    id: string;
    filters?: TFilter;
};

/**
 * Select multiple records
 */
export type TQuerySelectRecords<TFilter extends object | undefined = undefined> = {
    filters?: TFilter;
};

/**
 * Delete record schema
 */
export type TQueryDeleteRecord<TFilter extends object | undefined = undefined> = {
    id: string;
    filters?: TFilter;
};

// ===========================
// Types with userId
// ===========================

/**
 * Update record schema
 */
export type TQueryUpdateUserRecord<T> = TQueryUpdateRecord<T> & WithUserId;

/**
 * Insert record schema
 */
export type TQueryInsertUserRecord<T> = TQueryInsertRecord<T> & WithUserId;

/**
 * Select record schema by id and user
 */
export type TQuerySelectUserRecordById<TFilter extends object | undefined = undefined> =
    TQuerySelectRecordById<TFilter> & WithUserId;

/**
 * Select multiple records from user
 */
export type TQuerySelectUserRecords<TFilter extends object | undefined = undefined> =
    TQuerySelectRecords<TFilter> & WithUserId;

/**
 * Delete record schema
 */
export type TQueryDeleteUserRecord<TFilter extends object | undefined = undefined> =
    TQueryDeleteRecord<TFilter> & WithUserId;

/**
 * Configuration object for specifying which fields to include in CRUD operations
 */
interface IncludeObject {
    userId: boolean;
    filterById: boolean;
    filter: boolean;
    data: boolean;
}

/**
 * Mapping of include options to their corresponding object shapes
 */
interface IncludeMapping {
    userId: { userId: string };
    filterById: { id: string };
    filter: { filters: object };
    data: { data: object };
}

/**
 * Conditional type that builds an object based on which fields are included
 */
type IncludeConditional<O extends Partial<IncludeObject>> = (O['userId'] extends true
    ? IncludeMapping['userId']
    : object) &
    (O['filterById'] extends true ? IncludeMapping['filterById'] : object) &
    (O['filter'] extends true ? IncludeMapping['filter'] : object) &
    (O['data'] extends true ? IncludeMapping['data'] : object);

/**
 * CRUD input parameter types with conditional fields
 */
export type CrudInputTypes<
    O extends Partial<IncludeObject>,
    T extends object | undefined = undefined,
> = {
    get: IncludeConditional<O>;
    create: IncludeConditional<O> & { data: T };
    update: IncludeConditional<O> & { id: string; data: Partial<T> };
    delete: IncludeConditional<O> & { id: string };
};

// Export the conditional type for external use
export type { IncludeConditional, IncludeMapping, IncludeObject };

// Example usage:
// type GetInput = CrudInputTypes<{ userId: true; filterById: true }>['get'];
// type UpdateInput = CrudInputTypes<{ userId: true }>['update'];
