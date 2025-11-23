import { TZodShape } from '@/lib/schemas/types';
import { tableHasField } from '@/server/lib/db/drizzle';
import { InferTableSchema } from '@/server/lib/db/table/feature-config/types';
import { Prettify } from '@/types/utils';
import { EmptySchema } from '@/types/zod';
import { Table } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

/**
 * Extracts a Zod schema for a specific field from a Drizzle table.
 *
 * Returns a schema containing the specified field if it exists in the table,
 * or an empty schema if the field doesn't exist. The return type is statically
 * determined based on whether the field exists in the table's type definition.
 *
 * Uses function overloads to preserve type information about table columns,
 * ensuring downstream type inference works correctly.
 *
 * @param table - The Drizzle table instance
 * @param field - The column name to extract schema for
 * @returns A Zod schema containing the field (if it exists) or an empty schema
 *
 * @example
 * // Returns z.ZodObject<{ id: z.ZodNumber }> if 'id' exists
 * const idSchema = getSchemaForTableField(userTable, 'id');
 *
 * @example
 * // Returns z.ZodObject<{}> if 'nonExistent' doesn't exist
 * const emptySchema = getSchemaForTableField(userTable, 'nonExistent');
 */
export function getSchemaForTableField<
    TTable extends Table,
    TField extends keyof TTable['_']['columns'] & string,
>(
    table: TTable,
    field: TField
): z.ZodObject<Prettify<Pick<InferTableSchema<TTable, 'select'>['shape'], TField>>>;
export function getSchemaForTableField<TTable extends Table, TField extends string>(
    table: TTable,
    field: TField
): z.ZodObject<EmptySchema>;
export function getSchemaForTableField<TTable extends Table, TField extends string>(
    table: TTable,
    field: TField
): z.ZodObject<TZodShape> {
    if (tableHasField(table, field)) {
        const fullSchema = createSelectSchema(table);
        const pickMask: Record<string, true> = { [field]: true };
        return fullSchema.pick(pickMask);
    }

    return z.object({});
}
