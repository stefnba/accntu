import { BaseSchemaBuilder } from '@/lib/schemas/builder';
import { TZodObject } from '@/lib/schemas/types';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

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
