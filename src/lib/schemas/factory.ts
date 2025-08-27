import { createBaseSchemaFromTable, createTrueRecord } from '@/lib/schemas/helpers';
import { BaseFeatureSchema } from '@/lib/schemas/layers';
import { CreateOmittedSchema, CreatePickedSchema, TZodSchema } from '@/lib/schemas/types';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

/**
 * Factory class for creating feature schemas
 * @example
 * const tagSchemas = FeatureSchema.fromTable(tag, ['name', 'userId', 'id', 'id', 'isActive'])
 *     .createQuerySchema((baseSchema) => ({
 *         get: baseSchema.omit({
 */
export class FeatureSchema {
    /**
     * Create a base feature schema from a Drizzle table
     * @param table - The Drizzle table to create the schema from
     * @param omitFields - Optional fields to omit from the schema
     * @param pickFields - Optional fields to pick from the schema
     * @returns A base feature schema
     */
    static fromTable<TTable extends Table>(
        table: TTable
    ): BaseFeatureSchema<ReturnType<typeof createInsertSchema<TTable>>>;
    static fromTable<TTable extends Table>({
        table,
    }: {
        table: TTable;
    }): BaseFeatureSchema<ReturnType<typeof createInsertSchema<TTable>>>;
    static fromTable<
        TTable extends Table,
        TOmitFields extends readonly (keyof TTable['_']['columns'])[],
    >({
        table,
        omitFields,
    }: {
        table: TTable;
        omitFields: TOmitFields;
    }): BaseFeatureSchema<CreateOmittedSchema<TTable, TOmitFields>>;
    static fromTable<
        TTable extends Table,
        TPickFields extends readonly (keyof TTable['_']['columns'])[],
    >({
        table,
        pickFields,
    }: {
        table: TTable;
        pickFields: TPickFields;
    }): BaseFeatureSchema<CreatePickedSchema<TTable, TPickFields>>;
    static fromTable<
        TTable extends Table,
        TOmitFields extends readonly (keyof TTable['_']['columns'])[],
        TPickFields extends readonly (keyof TTable['_']['columns'])[],
    >(input: TTable | { table: TTable; omitFields?: TOmitFields; pickFields?: TPickFields }) {
        if (typeof input === 'object' && 'table' in input) {
            if (input.omitFields) {
                const omitFields = input.omitFields;
                return new BaseFeatureSchema(
                    createBaseSchemaFromTable(input.table).omit(
                        omitFields.length > 0 ? createTrueRecord(omitFields) : {}
                    )
                );
            }
            if (input.pickFields) {
                const pickFields = input.pickFields;
                return new BaseFeatureSchema(
                    createBaseSchemaFromTable(input.table).pick(
                        pickFields.length > 0 ? createTrueRecord(pickFields) : {}
                    )
                );
            }
        } else {
            return new BaseFeatureSchema(createBaseSchemaFromTable(input));
        }
    }

    /**
     * Create a base feature schema from a custom Zod schema
     * @param schema - The custom Zod schema to create the schema from
     * @returns A base feature schema
     */
    static fromSchema<TSchema extends TZodSchema>(schema: TSchema): BaseFeatureSchema<TSchema> {
        return new BaseFeatureSchema(schema);
    }
}
