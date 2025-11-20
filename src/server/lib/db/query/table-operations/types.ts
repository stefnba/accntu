import { GetTableColumnKeys } from '@/server/lib/db/drizzle';
import { DrizzleTypeError, GetColumnData, Table } from 'drizzle-orm';
import { TableLikeHasEmptySelection } from 'drizzle-orm/pg-core';

/**
 * The standard table operation types the TableOperationsBuilder supports
 */
export type TStandardTableOperation =
    | 'createRecord'
    | 'createManyRecords'
    | 'getFirstRecord'
    | 'getManyRecords'
    | 'updateRecord'
    | 'updateManyRecords'
    | 'removeRecord'
    | 'deactivateRecord'
    | 'activateRecord'
    | 'deleteRecord';

/**
 * Filter type for the CrudQueryBuilder.
 * Ensures that the field is a valid column in the table and the value is a valid type for the column.
 */
export type TBooleanFilter<T extends Table> = {
    [K in keyof T['_']['columns']]: {
        field: K;
        value: GetColumnData<T['_']['columns'][K], 'raw'>;
    };
}[keyof T['_']['columns']];

export type TValidTableForFrom<T extends Table> =
    TableLikeHasEmptySelection<T> extends true
        ? DrizzleTypeError<"Cannot reference a data-modifying statement subquery if it doesn't contain a `returning` clause">
        : T;

/**
 * The required only type
 */
export type RequiredOnly<T> = {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

/**
 * The input for the getById query
 */
export type TByIdInput<
    T extends Table,
    TIdFields extends Array<GetTableColumnKeys<T>>,
    TUserIdField extends GetTableColumnKeys<T> | undefined = undefined,
> =
    TUserIdField extends GetTableColumnKeys<T>
        ? {
              ids: {
                  [K in TIdFields[number]]: GetColumnData<T['_']['columns'][K]>;
              };
              userId: GetColumnData<T['_']['columns'][TUserIdField]>;
          }
        : {
              ids: {
                  [K in TIdFields[number]]: GetColumnData<T['_']['columns'][K]>;
              };
          };

/**
 * The on conflict type for the create and update record query
 * Supports all Drizzle ORM conflict resolution strategies with full type safety
 */
export type TOnConflict<T extends Table> =
    // Simple string shortcuts
    | 'ignore' // Shorthand for onConflictDoNothing()
    | 'fail' // Default behavior - let the database handle conflicts
    // Ignore conflicts with optional target specification
    | {
          type: 'ignore';
          target?: Array<GetTableColumnKeys<T>> | GetTableColumnKeys<T>;
      }
    // Fail on conflicts (explicit - same as omitting onConflict)
    | {
          type: 'fail';
      }
    // Update on conflicts with excluded values (full upsert)
    | {
          type: 'update';
          target: Array<GetTableColumnKeys<T>> | GetTableColumnKeys<T>;
          setExcluded?: Array<GetTableColumnKeys<T>>; // Use excluded.column values
          where?: Array<TBooleanFilter<T>>; // Optional conditions for the update
      }
    // Update on conflicts with custom set values
    | {
          type: 'updateSet';
          target: Array<GetTableColumnKeys<T>> | GetTableColumnKeys<T>;
          set: Partial<{
              [K in keyof T['_']['columns']]: GetColumnData<T['_']['columns'][K], 'raw'>;
          }>;
          where?: Array<TBooleanFilter<T>>; // Optional conditions for the update
      }
    // Mixed update: some excluded values, some custom values
    | {
          type: 'updateMixed';
          target: Array<GetTableColumnKeys<T>> | GetTableColumnKeys<T>;
          setExcluded?: Array<GetTableColumnKeys<T>>; // Columns to use excluded values
          set?: Partial<{
              [K in keyof T['_']['columns']]: GetColumnData<T['_']['columns'][K], 'raw'>;
          }>;
          where?: Array<TBooleanFilter<T>>; // Optional conditions for the update
      };

/**
 * Ordering for the getManyRecords operation.
 * Supports both array of objects and array of column keys. If only a column key is provided, it will be ordered by ascending.
 * @example
 * ```typescript
 * const ordering: TOrderBy<Table> = [
 *     { field: 'createdAt', direction: 'asc' },
 *     'name',
 * ];
 * ```
 */
export type TOrderBy<T extends Table> =
    | Array<{
          field: GetTableColumnKeys<T>;
          direction: 'asc' | 'desc';
      }>
    | Array<GetTableColumnKeys<T>>;

/**
 * Pagination for the getManyRecords operation.
 * @example
 * ```typescript
 * const pagination: TPagination = {
 *     page: 1,
 *     pageSize: 10,
 * };
 */
export type TPagination = {
    page?: number;
    pageSize?: number;
};
