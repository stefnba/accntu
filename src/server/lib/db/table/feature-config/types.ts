import { Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';
import z from 'zod';

export type InferTableSchema<
    TTable extends Table,
    TType extends 'insert' | 'select' | 'update' = 'insert',
> = BuildSchema<TType, TTable['_']['columns'], undefined, undefined>;

export type IsEmptySchema<T> =
    T extends z.ZodObject<infer S> ? (keyof S extends never ? true : false) : false;

export type InferSchemaIfExists<T> = IsEmptySchema<T> extends true ? undefined : z.infer<T>;

/**
 * Empty schema sentinel - used as default when Id fields or UserId field is not set.

 * This makes the `IsEmptySchema` type helper work correctly.
 */
export type EmptySchema = Record<never, never>;
