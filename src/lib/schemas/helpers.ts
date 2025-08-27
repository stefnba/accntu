import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Creates a record object where each field name maps to `true`
 * Used by Zod's omit/pick methods which expect { field: true } format
 * @param fields - Array of field names to convert
 * @returns Record mapping each field to true
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

/** Internal type for creating schemas with omitted fields from Drizzle tables */
type CreateOmittedSchema<
    TTable extends Table,
    TOmitFields extends readonly (keyof TTable['_']['columns'])[],
> = z.ZodObject<Omit<ReturnType<typeof createInsertSchema<TTable>>['shape'], TOmitFields[number]>>;
/**
 * Creates a Zod schema from a Drizzle table with optional field omission
 * Overloaded to provide exact type inference for both use cases
 */
export function createBaseSchemaFromTable<TTable extends Table>(
    table: TTable
): ReturnType<typeof createInsertSchema<TTable>>;

export function createBaseSchemaFromTable<
    TTable extends Table,
    const TOmitFields extends readonly (keyof TTable['_']['columns'])[],
>(table: TTable, defaultOmitFields: TOmitFields): CreateOmittedSchema<TTable, TOmitFields>;

/**
 * Implementation that creates base schema with conditional field omission
 * @param table - Drizzle table to generate schema from
 * @param defaultOmitFields - Optional fields to exclude from the schema
 * @returns Zod schema with or without omitted fields
 */
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
