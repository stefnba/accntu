import { BaseSchemaBuilder } from '@/lib/schemas/builder';
import { BuildSchemaFromTable, TOperationSchemaObject, TZodObject } from '@/lib/schemas/types';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { util } from 'zod';

/**
 * Factory for creating feature schemas with fluent API for schema composition.
 * Provides methods to start schema building from either Drizzle tables or Zod schemas.
 * 
 * @example
 * ```typescript
 * // From Drizzle table
 * const { schemas } = createFeatureSchemas
 *   .registerTable(tagTable)
 *   .omit({ createdAt: true })
 *   .addCore('create', ({ baseSchema }) => ({ service: baseSchema }));
 * 
 * // From Zod schema  
 * const { schemas } = createFeatureSchemas
 *   .registerSchema(customSchema)
 *   .addCustom('validate', ({ baseSchema }) => ({ endpoint: baseSchema }));
 * ```
 */
export const createFeatureSchemas = {
    /**
     * Creates a schema builder from a Drizzle table definition.
     * Automatically generates Zod schema from table structure using drizzle-zod.
     * 
     * @template TTable - The Drizzle table type
     * @param table - The Drizzle table instance
     * @returns BaseSchemaBuilder instance for fluent schema composition
     * 
     * @example
     * ```typescript
     * const builder = createFeatureSchemas.registerTable(userTable);
     * // Now you can chain operations like .omit(), .pick(), .addCore(), etc.
     * ```
     */
    registerTable: <TTable extends Table>(table: TTable) => {
        const schema = createInsertSchema(table);
        return new BaseSchemaBuilder({
            schemas: {},
            baseSchema: schema.shape,
            rawSchema: schema.shape,
        });
    },

    /**
     * Creates a schema builder from an existing Zod schema object.
     * Useful when you have custom validation schemas not derived from database tables.
     * 
     * @template TSchema - The Zod object schema type
     * @param schema - The Zod schema object
     * @returns BaseSchemaBuilder instance for fluent schema composition
     * 
     * @example
     * ```typescript
     * const customSchema = z.object({ name: z.string(), age: z.number() });
     * const builder = createFeatureSchemas.registerSchema(customSchema);
     * ```
     */
    registerSchema: <TSchema extends TZodObject>(schema: TSchema) => {
        return new BaseSchemaBuilder({
            schemas: {},
            baseSchema: schema.shape,
            rawSchema: schema.shape,
        });
    },
};

// Overload 1: no config
export function createSchemasFactory<TTable extends Table>(
    table: TTable
): BaseSchemaBuilder<
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
): BaseSchemaBuilder<
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
): BaseSchemaBuilder<
    Record<string, TOperationSchemaObject>,
    Pick<
        BuildSchemaFromTable<TTable>['shape'],
        keyof TPickMask & keyof BuildSchemaFromTable<TTable>['shape']
    >,
    BuildSchemaFromTable<TTable>['shape']
>;

/**
 * Factory function to create feature schemas from a Drizzle table with field filtering.
 * This is a convenience function that combines table registration with field selection.
 * 
 * @template TTable - The Drizzle table type
 * @template TPickMask - The fields to pick (when using pickFields)
 * @template TOmitMask - The fields to omit (when using omitFields)
 * @param table - The Drizzle table instance
 * @param config - Optional configuration for field filtering
 * @param config.pickFields - Fields to include (mutually exclusive with omitFields)
 * @param config.omitFields - Fields to exclude (mutually exclusive with pickFields)
 * @returns BaseSchemaBuilder instance with field filtering applied
 * 
 * @example
 * ```typescript
 * // Include only specific fields
 * const builder = createSchemasFactory(userTable, {
 *   pickFields: { name: true, email: true }
 * });
 * 
 * // Exclude audit fields
 * const builder = createSchemasFactory(userTable, {
 *   omitFields: { createdAt: true, updatedAt: true }
 * });
 * 
 * // No filtering (equivalent to createFeatureSchemas.registerTable(table))
 * const builder = createSchemasFactory(userTable);
 * ```
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
