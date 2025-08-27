import { createBaseSchemaFromTable, createTrueRecord } from '@/lib/schemas/helpers';
import { BaseFeatureSchema } from '@/lib/schemas/layers';
import { CreateOmittedSchema, CreatePickedSchema, TZodSchema } from '@/lib/schemas/types';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

/**
 * Factory class for creating layered feature schemas with full type safety
 *
 * Features:
 * - Builds schemas from Drizzle tables or custom Zod schemas
 * - Supports field omission/picking for flexible schema creation
 * - Enables fluent API for progressive layer building
 * - Maintains type safety across all layers
 *
 * @example
 * ```typescript
 * const userSchemas = FeatureSchema.fromTable(userTable)
 *   .createQuerySchema((base) => ({ get: base.pick({ id: true }) }))
 *   .createServiceSchema((query) => ({ create: query.get.extend({ password: z.string() }) }))
 *   .build();
 * ```
 */
export class FeatureSchema {
    /**
     * Creates a base feature schema from a Drizzle table with optional field filtering
     * Supports multiple overloads for different use cases:
     * - Direct table input
     * - Object input with omitFields for excluding specific columns
     * - Object input with pickFields for including only specific columns
     * @returns BaseFeatureSchema ready for layer building
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
     * Creates a base feature schema from a custom Zod schema
     * Useful when you need schemas not derived from database tables
     * @param schema - The custom Zod schema to wrap
     * @returns BaseFeatureSchema ready for layer building
     */
    static fromSchema<TSchema extends TZodSchema>(schema: TSchema): BaseFeatureSchema<TSchema> {
        return new BaseFeatureSchema(schema);
    }
}
