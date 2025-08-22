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
