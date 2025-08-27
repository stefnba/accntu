import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Create a record of fields to omit from a Zod schema
 * @param fields - The fields to omit
 * @returns A record of fields to omit
 */
export const createTrueRecord = <T extends string | number | symbol>(
    fields: readonly T[]
): Record<T, true> => {
    return fields.reduce(
        (acc, field) => {
            acc[field] = true;
            return acc;
        },
        {} as Record<T, true>
    );
};

type CreateOmittedSchema<
    TTable extends Table,
    TOmitFields extends readonly (keyof TTable['_']['columns'])[],
> = z.ZodObject<Omit<ReturnType<typeof createInsertSchema<TTable>>['shape'], TOmitFields[number]>>;

// Function overloads for better type inference
export function createBaseSchemaFromTable<TTable extends Table>(
    table: TTable
): ReturnType<typeof createInsertSchema<TTable>>;

export function createBaseSchemaFromTable<
    TTable extends Table,
    const TOmitFields extends readonly (keyof TTable['_']['columns'])[],
>(table: TTable, defaultOmitFields: TOmitFields): CreateOmittedSchema<TTable, TOmitFields>;

export function createBaseSchemaFromTable<
    TTable extends Table,
    TOmitFields extends readonly (keyof TTable['_']['columns'])[],
>(table: TTable, defaultOmitFields?: TOmitFields) {
    const baseSchema = createInsertSchema(table);

    if (!defaultOmitFields || defaultOmitFields.length === 0) {
        return baseSchema;
    }

    return baseSchema.omit(defaultOmitFields.length > 0 ? createTrueRecord(defaultOmitFields) : {});
}
