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
 * The columns of a table
 */
export type TTableColumns<T extends Table> = keyof T['_']['columns'];

/**
 * The required only type
 */
export type RequiredOnly<T> = {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

/**
 * The input for the get by id query
 */
export type TByIdInput<
    T extends Table,
    TIdFields extends Array<keyof T['_']['columns']>,
    TUserIdField extends keyof T['_']['columns'] | undefined = undefined,
> = TUserIdField extends keyof T['_']['columns']
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
