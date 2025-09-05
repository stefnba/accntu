import { BaseSchemaBuilderFactory } from '@/lib/schemas/builder';
import { BuildSchemaFromTable, TOperationSchemaObject, TZodObject } from '@/lib/schemas/types';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { util } from 'zod';

export const createFeatureSchemas = {
    /**
     * Creates feature schemas from a Drizzle table
     * @param table - The Drizzle table
     */
    registerTable: <TTable extends Table>(table: TTable) => {
        const schema = createInsertSchema(table);
        return new BaseSchemaBuilderFactory({
            schemas: {},
            baseSchema: schema.shape,
            rawSchema: schema.shape,
        });
    },

    /**
     * Creates feature schemas from a Zod schema
     * @param schema - The Zod schema
     */
    registerSchema: <TSchema extends TZodObject>(schema: TSchema) => {
        return new BaseSchemaBuilderFactory({
            schemas: {},
            baseSchema: schema.shape,
            rawSchema: schema.shape,
        });
    },
};

// Overload 1: no config
export function createSchemasFactory<TTable extends Table>(
    table: TTable
): BaseSchemaBuilderFactory<
    Record<string, TOperationSchemaObject>,
    BuildSchemaFromTable<TTable>['shape'],
    BuildSchemaFromTable<TTable>['shape']
>;

// Overload 2: omit fields
export function createSchemasFactory<
    TTable extends Table,
    TOmitMask extends util.Mask<keyof BuildSchemaFromTable<TTable>['shape']>,
>(
    table: TTable,
    config: { omitFields: TOmitMask; pickFields?: never }
): BaseSchemaBuilderFactory<
    Record<string, TOperationSchemaObject>,
    Omit<BuildSchemaFromTable<TTable>['shape'], keyof TOmitMask>,
    BuildSchemaFromTable<TTable>['shape']
>;

// Overload 3: pick fields
export function createSchemasFactory<
    TTable extends Table,
    TPickMask extends util.Mask<keyof BuildSchemaFromTable<TTable>['shape']>,
>(
    table: TTable,
    config: { pickFields: TPickMask; omitFields?: never }
): BaseSchemaBuilderFactory<
    Record<string, TOperationSchemaObject>,
    Pick<
        BuildSchemaFromTable<TTable>['shape'],
        keyof TPickMask & keyof BuildSchemaFromTable<TTable>['shape']
    >,
    BuildSchemaFromTable<TTable>['shape']
>;

/**
 * Factory function to create feature schemas from a Drizzle table
 * @param table - The Drizzle table
 * @param config - The configuration object
 * @returns A feature schema builder factory
 */
export function createSchemasFactory<
    TTable extends Table,
    TPickMask extends util.Mask<keyof BuildSchemaFromTable<TTable>['shape']>,
    TOmitMask extends util.Mask<keyof BuildSchemaFromTable<TTable>['shape']>,
>(table: TTable, config?: { pickFields: TPickMask } | { omitFields: TOmitMask }) {
    const baseSchema = createFeatureSchemas.registerTable(table);

    if (!config) {
        return baseSchema;
    }

    if ('pickFields' in config) {
        return baseSchema.pick(config.pickFields);
    }

    if ('omitFields' in config) {
        return baseSchema.omit(config.omitFields);
    }

    return baseSchema;
}
