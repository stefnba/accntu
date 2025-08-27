import { BaseFeatureSchema } from '@/lib/schemas/base';
import {
    buildCrudOpSchema,
    createBaseSchemaFromTable,
    createTrueRecord,
    operation,
} from '@/lib/schemas/helpers';
import { CreateOmittedSchema, CreatePickedSchema, TZodSchema } from '@/lib/schemas/types';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

/**
 * Factory for creating feature schemas from Drizzle tables with full type safety
 *
 * Core features:
 * - Creates schemas from database tables with field filtering (omit/pick)
 * - Defines operation-specific schemas (create, update, etc.) with service/endpoint layers
 * - Supports dynamic schema creation via helpers.operation() for schema reuse
 * - Provides direct schema access with perfect intellisense (e.g., schemas.create.service)
 *
 * @example
 * ```typescript
 * const tagSchemas = FeatureSchema.fromTable({
 *   table: tag,
 *   omitFields: ['id', 'createdAt']
 * }).forOperations(({ base }) => ({
 *   create: { service: base, endpoint: base },
 *   assign: FeatureSchema.helpers.operation(() => {
 *     const shared = z.object({ ids: z.array(z.string()) });
 *     return { service: shared, endpoint: shared };
 *   })
 * }));
 * ```
 */
export class FeatureSchema {
    /**
     * Helper utilities for advanced schema creation patterns
     */
    static helpers = {
        /**
         * Creates an operation schema with dynamic logic while maintaining perfect intellisense.
         * Executes the function immediately to return a plain object for TypeScript inference.
         *
         * Use this when you need to:
         * - Share schemas between service/endpoint layers
         * - Create schemas with conditional logic
         * - Reuse schema definitions within an operation
         *
         * @param fn - Function that returns an operation schema definition
         * @returns The resolved operation schema with full type support
         *
         * @example
         * ```typescript
         * assignToTransaction: FeatureSchema.helpers.operation(() => {
         *   const shared = z.object({ transactionId: z.string(), tagIds: z.array(z.string()) });
         *   return { service: shared, endpoint: shared };
         * })
         * ```
         */
        operation,
        buildCrudOpSchema,
    } as const;

    /**
     * Default CRUD schemas
     *
     * @example
     * ```typescript
     * const tagSchemas = FeatureSchema.fromTable({
     *   table: tag,
     *   omitFields: ['id', 'createdAt']
     * }).forOperations(({ base }) => ({
     *   create: { service: FeatureSchema.default.create(base), endpoint: base },
     *   getById: { service: FeatureSchema.default.getById, endpoint: base },
     *   removeById: { service: FeatureSchema.default.removeById, endpoint: base },
     *   updateById: { service: FeatureSchema.default.updateById(base), endpoint: base },
     *   getMany: { service: FeatureSchema.default.getMany(base), endpoint: base },
     * }));
     */
    static default = {
        create: <const TData extends TZodSchema>(data: TData) =>
            buildCrudOpSchema({
                userId: true,
                id: false,
                data,
            }),
        getById: buildCrudOpSchema({ userId: true, id: true }),
        removeById: buildCrudOpSchema({ userId: true, id: true }),
        updateById: <const TData extends TZodSchema>(data: TData) =>
            buildCrudOpSchema({ userId: true, id: true, data }),

        getMany: Object.assign(
            <const TFilters extends TZodSchema>(filters: TFilters) =>
                buildCrudOpSchema({ userId: true, id: false, filters }),
            () => buildCrudOpSchema({ userId: true, id: false })
        ),
    } as const;

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
    ): BaseFeatureSchema<
        ReturnType<typeof createInsertSchema<TTable>>,
        ReturnType<typeof createInsertSchema<TTable>>
    >;
    static fromTable<TTable extends Table>({
        table,
    }: {
        table: TTable;
    }): BaseFeatureSchema<
        ReturnType<typeof createInsertSchema<TTable>>,
        ReturnType<typeof createInsertSchema<TTable>>
    >;
    static fromTable<
        TTable extends Table,
        TOmitFields extends readonly (keyof TTable['_']['columns'])[],
    >({
        table,
        omitFields,
    }: {
        table: TTable;
        omitFields: TOmitFields;
    }): BaseFeatureSchema<
        CreateOmittedSchema<TTable, TOmitFields>,
        ReturnType<typeof createInsertSchema<TTable>>
    >;
    static fromTable<
        TTable extends Table,
        TPickFields extends readonly (keyof TTable['_']['columns'])[],
    >({
        table,
        pickFields,
    }: {
        table: TTable;
        pickFields: TPickFields;
    }): BaseFeatureSchema<
        CreatePickedSchema<TTable, TPickFields>,
        ReturnType<typeof createInsertSchema<TTable>>
    >;
    static fromTable<
        TTable extends Table,
        TOmitFields extends readonly (keyof TTable['_']['columns'])[],
        TPickFields extends readonly (keyof TTable['_']['columns'])[],
    >(input: TTable | { table: TTable; omitFields?: TOmitFields; pickFields?: TPickFields }) {
        if (typeof input === 'object' && 'table' in input) {
            const rawSchema = createBaseSchemaFromTable(input.table);
            if (input.omitFields) {
                const omitFields = input.omitFields;
                return new BaseFeatureSchema(
                    rawSchema.omit(omitFields.length > 0 ? createTrueRecord(omitFields) : {}),
                    rawSchema
                );
            }
            if (input.pickFields) {
                const pickFields = input.pickFields;
                return new BaseFeatureSchema(
                    rawSchema.pick(pickFields.length > 0 ? createTrueRecord(pickFields) : {}),
                    rawSchema
                );
            }
            return new BaseFeatureSchema(rawSchema, rawSchema);
        } else {
            const rawSchema = createBaseSchemaFromTable(input);
            return new BaseFeatureSchema(rawSchema, rawSchema);
        }
    }

    /**
     * Creates a base feature schema from a custom Zod schema
     * Useful when you need schemas not derived from database tables
     * @param schema - The custom Zod schema to wrap
     * @returns BaseFeatureSchema ready for layer building
     */
    static fromSchema<TSchema extends TZodSchema>(
        schema: TSchema
    ): BaseFeatureSchema<TSchema, TSchema> {
        return new BaseFeatureSchema(schema, schema);
    }
}
