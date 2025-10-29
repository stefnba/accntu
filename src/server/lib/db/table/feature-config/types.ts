import { Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';

export type InferTableSchema<
    TTable extends Table,
    TType extends 'insert' | 'select' | 'update' = 'insert',
> = BuildSchema<TType, TTable['_']['columns'], undefined, undefined>;
