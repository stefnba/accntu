import { tag } from '@/server/db/tables';
import { InferDefaultSchemaForField } from '@/server/lib/db/table/feature-config/types';
import { getTableColumns, Table } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

/**
 * Check if drizzle table contains a specific column name.
 * @returns true or false
 */
export const tableHasField = (
    table: Table,
    field: string
): field is keyof Table['_']['columns'] => {
    const cols = getTableColumns(table);
    if (Object.keys(cols).includes(field)) {
        return true;
    }
    return false;
};

/**
 * If the table contains the field, the schema for this field is extracted, otherwise empty schema is returned
 * @param table
 * @param field
 * @returns
 */
export const getIdSchemaForTableField = <TTable extends Table, TField extends string = 'id'>(
    table: TTable,
    field?: TField
): InferDefaultSchemaForField<TTable, TField> => {
    // get schema for table

    const _field = field || 'id';

    if (tableHasField(table, _field)) {
        const schema = createSelectSchema(tag);
        // todo remove as any
        return schema.pick({ [_field]: true }) as any;
    }
    // todo remove as any
    return z.object({}) as any;
};
