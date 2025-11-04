import {
    EmptySchema,
    InferDefaultSchemaForField,
} from '@/server/lib/db/table/feature-config/types';
import { getTableColumns, Table } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

/**
 * Type guard that checks if a Drizzle table contains a specific column.
 *
 * Narrows the `field` parameter to be a valid key of the table's columns,
 * enabling type-safe column access in subsequent operations.
 *
 * @param table - The Drizzle table instance to check
 * @param field - The column name to search for
 * @returns Type predicate indicating if the field exists as a column
 *
 * @example
 * if (tableHasField(userTable, 'email')) {
 *   // TypeScript now knows 'email' is a valid column
 * }
 */
export const tableHasField = (
    table: Table,
    field: string
): field is keyof Table['_']['columns'] => {
    const cols = getTableColumns(table);
    return Object.keys(cols).includes(field);
};

/**
 * Extracts a Zod schema for a specific field from a Drizzle table.
 *
 * Returns a schema containing the specified field if it exists in the table,
 * or an empty schema if the field doesn't exist. The return type is statically
 * determined based on whether the field exists in the table's type definition.
 *
 * @param table - The Drizzle table instance
 * @param field - The column name to extract schema for
 * @returns A Zod schema containing the field (if it exists) or an empty schema
 *
 * @example
 * // Returns z.ZodObject<{ id: z.ZodNumber }> if 'id' exists
 * const idSchema = getIdSchemaForTableField(userTable, 'id');
 *
 * @example
 * // Returns z.ZodObject<{}> if 'nonExistent' doesn't exist
 * const emptySchema = getIdSchemaForTableField(userTable, 'nonExistent');
 */
export function getIdSchemaForTableField<TTable extends Table, TField extends string>(
    table: TTable,
    field: TField
): InferDefaultSchemaForField<TTable, TField> {
    if (tableHasField(table, field)) {
        const fullSchema = createSelectSchema(table);
        const pickMask: Record<string, true> = { [field]: true };
        // Safe when TField is a literal type: TypeScript evaluates the conditional type at
        // compile time (checking if the literal extends keyof columns), while runtime logic
        // verifies field existence. Both align when using literal strings like 'id' or 'userId'.
        return fullSchema.pick(pickMask) as InferDefaultSchemaForField<TTable, TField>;
    }

    // Safe when TField is a literal type not in columns: both compile-time and runtime
    // agree the field doesn't exist, so returning EmptySchema is correct.
    return z.object({}) as z.ZodObject<EmptySchema> as InferDefaultSchemaForField<TTable, TField>;
}
