import { CreatePickedSchema } from '@/lib/schemas/types';
import { SchemaObjectBuilder } from '@/lib/schemasBuilder/builder';
import { createBaseSchemaFromTable, createTrueRecord } from '@/lib/schemasBuilder/helpers';
import {
    CreateOmittedSchema,
    TOperationSchemaObject,
    TZodSchema,
} from '@/lib/schemasBuilder/types';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

/**
 * Factory function for creating schema builders with withOperations method
 * This is the DRY implementation used by both fromTable and fromSchema
 */
const createSchemaBuilder = <T extends TZodSchema>(baseSchema: T) => ({
    /**
     * Add operations to the schema
     */
    withOperationBuilder: <TSchemas extends Record<string, TOperationSchemaObject>>(
        builderCallback: (
            builder: SchemaObjectBuilder<T, Record<string, TOperationSchemaObject>, never>
        ) => SchemaObjectBuilder<T, TSchemas, string>
    ): TSchemas => {
        const initialBuilder = new SchemaObjectBuilder<
            T,
            Record<string, TOperationSchemaObject>,
            never
        >({
            schemas: {},
            baseSchema,
        });
        return builderCallback(initialBuilder).build();
    },
    /**
     * Transform the schema
     */
    transform: <TOut extends TZodSchema>(transformer: (schema: T) => TOut) => {
        return createSchemaBuilder(transformer(baseSchema));
    },
});

export class FeatureSchema {
    /**
     * Create a feature schema from an existing Zod schema
     */
    static fromSchema<T extends TZodSchema>(schema: T) {
        return createSchemaBuilder(schema);
    }

    /**
     * Creates a base feature schema from a Drizzle table with optional field filtering
     * Supports multiple overloads for different use cases:
     * - Direct table input
     * - Object input with omitFields for excluding specific columns
     * - Object input with pickFields for including only specific columns
     * @param table - Drizzle table to generate schema from
     * @param config - Configuration object for the schema
     * @param config.omitFields - Fields to omit from the schema
     * @param config.pickFields - Fields to include in the schema
     * @returns BaseFeatureSchema ready for layer building
     */
    // only table input
    static fromTable<TTable extends Table>(
        table: TTable
    ): ReturnType<typeof createSchemaBuilder<ReturnType<typeof createInsertSchema<TTable>>>>;

    // Table with omitFields
    static fromTable<
        TTable extends Table,
        TOmitFields extends readonly (keyof TTable['_']['columns'])[],
    >(
        table: TTable,
        config: {
            omitFields: TOmitFields;
            pickFields?: never;
        }
    ): ReturnType<typeof createSchemaBuilder<CreateOmittedSchema<TTable, TOmitFields>>>;

    // Table with pickFields
    static fromTable<
        TTable extends Table,
        TPickFields extends readonly (keyof TTable['_']['columns'])[],
    >(
        table: TTable,
        config: {
            pickFields: TPickFields;

            omitFields?: never;
        }
    ): ReturnType<typeof createSchemaBuilder<CreatePickedSchema<TTable, TPickFields>>>;

    // implementation
    static fromTable<
        TTable extends Table,
        TOmitFields extends readonly (keyof TTable['_']['columns'])[],
        TPickFields extends readonly (keyof TTable['_']['columns'])[],
    >(
        table: TTable,
        config?: {
            /*
            dasf
            */
            omitFields?: TOmitFields;
            /*
            dasf
            */
            pickFields?: TPickFields;
        }
    ) {
        const rawSchema = createBaseSchemaFromTable(table);

        // if no config, return the schema builder
        if (!config) {
            return createSchemaBuilder(rawSchema);
        }

        // if omitFields, return the schema builder with the omitted fields
        if (config.omitFields) {
            const omitFields = config.omitFields;
            return createSchemaBuilder(
                rawSchema.omit(omitFields.length > 0 ? createTrueRecord(omitFields) : {})
            );
        }

        // if pickFields, return the schema builder with the picked fields
        if (config.pickFields) {
            const pickFields = config.pickFields;
            return createSchemaBuilder(
                rawSchema.pick(pickFields.length > 0 ? createTrueRecord(pickFields) : {})
            );
        }

        // if no config, return the schema builder
        return createSchemaBuilder(rawSchema);
    }
}
