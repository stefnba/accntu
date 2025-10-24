import { DrizzleTypeError, GetColumnData, Table } from 'drizzle-orm';
import { TableLikeHasEmptySelection } from 'drizzle-orm/pg-core';

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
          target?: Array<TTableColumns<T>> | TTableColumns<T>;
      }
    // Fail on conflicts (explicit - same as omitting onConflict)
    | {
          type: 'fail';
      }
    // Update on conflicts with excluded values (full upsert)
    | {
          type: 'update';
          target: Array<TTableColumns<T>> | TTableColumns<T>;
          setExcluded?: Array<TTableColumns<T>>; // Use excluded.column values
          where?: Array<TBooleanFilter<T>>; // Optional conditions for the update
      }
    // Update on conflicts with custom set values
    | {
          type: 'updateSet';
          target: Array<TTableColumns<T>> | TTableColumns<T>;
          set: Partial<{
              [K in keyof T['_']['columns']]: GetColumnData<T['_']['columns'][K], 'raw'>;
          }>;
          where?: Array<TBooleanFilter<T>>; // Optional conditions for the update
      }
    // Mixed update: some excluded values, some custom values
    | {
          type: 'updateMixed';
          target: Array<TTableColumns<T>> | TTableColumns<T>;
          setExcluded?: Array<TTableColumns<T>>; // Columns to use excluded values
          set?: Partial<{
              [K in keyof T['_']['columns']]: GetColumnData<T['_']['columns'][K], 'raw'>;
          }>;
          where?: Array<TBooleanFilter<T>>; // Optional conditions for the update
      };

// ========================================
// Drizzle Table Utilities
// ========================================

/**
 * The columns of a drizzle table
 * @example
 * ```typescript
 * type T = TTableColumns<typeof tag>;
 * // 'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'
 * ```
 */
export type TTableColumns<T extends Table> = keyof T['_']['columns'];

/**
 * Get the full column definitions of a drizzle table
 * @param T - The table to get the column definitions from
 * @example
 * ```typescript
 * type T = GetTableColumnDefinitions<typeof tag>;
* {
    name: PgColumn<{
        name: "name";
        tableName: "tag";
        dataType: "string";
        columnType: "PgText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
    }, {}, {}>;
    ... 6 more ...;
    updatedAt: PgColumn<...>;
}
 * ```
 */
export type GetTableColumnDefinitions<T extends Table> = T['_']['columns'];

/**
 * Get the keys of the columns of a drizzle table
 * @param T - The table to get the column keys from
 * @example
 * ```typescript
 * type T = GetTableColumnKeys<typeof tag>;
 * // 'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'
 * ```
 */
export type GetTableColumnKeys<T extends Table> = keyof GetTableColumnDefinitions<T>;

/**
 * Infer the types of the columns of a drizzle table
 * @param T - The table to infer the column types from
 * @param M - The mode to infer the column types in ('query' | 'raw')
 * @example
 * ```typescript
 * type T = InferTableColumnTypes<typeof tag>;
 * // {
 * //   id: string;
 * //   name: string;
 * //   description: string | null;
 * //   createdAt: Date;
 * //   updatedAt: Date;
 * // }
 * ```
 */
export type InferTableColumnTypes<T extends Table, M extends 'query' | 'raw' = 'query'> = {
    [K in GetTableColumnKeys<T>]: GetColumnData<GetTableColumnDefinitions<T>[K], M>;
};

/**
 * Infer the type of a column of a drizzle table
 * @param T - The table to infer the column type from
 * @param C - The column to infer the type from
 * @param M - The mode to infer the column type in ('query' | 'raw')
 * @example
 * ```typescript
 * type T = InferTableColumnType<typeof tag, 'createdAt'>;
 * // Date
 * ```
 */
export type InferTableColumnType<
    T extends Table,
    C extends GetTableColumnKeys<T>,
    M extends 'query' | 'raw' = 'query',
> = InferTableColumnTypes<T, M>[C];

/**
 * Infer the type of a column of a drizzle table as an object
 * @param T - The table to infer the column type from
 * @param C - The column to infer the type from
 * @param M - The mode to infer the column type in ('query' | 'raw')
 * @example
 * ```typescript
 * type T = InferTableColumnTypeAsObject<typeof tag, 'userId'>;
 * // {
 * //   userId: string;
 * // }
 * ```
 */
export type InferTableColumnTypeAsObject<
    T extends Table,
    C extends GetTableColumnKeys<T>,
    M extends 'query' | 'raw' = 'query',
> = {
    [K in C]: InferTableColumnType<T, K, M>;
};
