import {
    AvailableOperationKeys,
    OperationSchemaDefinitionFn,
    TOperationSchemaObject,
} from '@/lib/schemasBuilder/types';












/**
 * Factory function for creating schema builders with withOperations method
 * This is the DRY implementation used by both fromTable and fromSchema
 */
export const createSchemaBuilder = <S extends TZodSchema>(baseSchema: S) => ({
    /**
     * Add operations to the schema
     */
    withOperationBuilder: <TSchemas extends Record<string, TOperationSchemaObject>>(
        builderCallback: (
            builder: SchemaObjectBuilder<S, Record<string, TOperationSchemaObject>, never>
        ) => SchemaObjectBuilder<S, TSchemas, string>
    ): TSchemas => {
        const initialBuilder = new SchemaObjectBuilder<
            S,
            Record<string, TOperationSchemaObject>,
            never
        >({
            schemas: {},
            baseSchema,
        });

        // call the builder callback and return the built schemas
        return builderCallback(initialBuilder).build();
    },
    /**
     * Transform the schema
     */
    transform: <TOut extends TZodSchema>(transformer: (schema: S) => TOut) => {
        return createSchemaBuilder(transformer(baseSchema));
    },
});

export class SchemaObjectBuilder<
    TBaseSchema extends TZodSchema,
    TOutputSchemas extends Record<string, TOperationSchemaObject> = Record<
        string,
        TOperationSchemaObject
    >,
    TUsedKeys extends string = never,
> {
    private schemas: TOutputSchemas;
    private baseSchema: TBaseSchema;
    // defineSchema = {
    //     endpoint: defineEndpointSchema,
    // };

    constructor({
        schemas,
        baseSchema
    }: {
        schemas: TOutputSchemas;
        baseSchema: TBaseSchema;
    }) {
        this.baseSchema = baseSchema;
        this.schemas = schemas;
    }

    /**
     * Adds an operation to the schemas object
     * @param key - The key of the operation
     * @param schemaOrFn - The schema or function that returns the schema
     * @returns The updated schemas object
     */

    // Overload 1: Function input with baseSchema parameter
    addOperation<
        K extends AvailableOperationKeys<TUsedKeys>,
        S extends TOperationSchemaObject
    >(
        key: K,
        schemaFn: OperationSchemaDefinitionFn<TBaseSchema, S>
    ): SchemaObjectBuilder<TBaseSchema, TOutputSchemas & Record<K, S>, TUsedKeys | K>;

    // Overload 2: Direct schema input
    addOperation<
        K extends AvailableOperationKeys<TUsedKeys>,
        S extends TOperationSchemaObject
    >(
        key: K,
        schema: S
    ): SchemaObjectBuilder<TBaseSchema, TOutputSchemas & Record<K, S>, TUsedKeys | K>;

    // Implementation
    addOperation<
        K extends AvailableOperationKeys<TUsedKeys>,
        S extends TOperationSchemaObject
    >(
        key: K,
        schemaOrFn: S | OperationSchemaDefinitionFn<TBaseSchema, S>
    ): SchemaObjectBuilder<TBaseSchema, TOutputSchemas & Record<K, S>, TUsedKeys | K> {
        const resolvedSchema =
            typeof schemaOrFn === 'function'
                ? schemaOrFn({ baseSchema: this.baseSchema })
                : schemaOrFn;

        return new SchemaObjectBuilder<TBaseSchema, TOutputSchemas & Record<K, S>, TUsedKeys | K>({
            schemas: {
                ...this.schemas,
                [key]: resolvedSchema,
            },
            baseSchema: this.baseSchema,
        });
    }

    /**
     * Builds the final schemas object
     * @returns The final schemas object
     */
    build(): TOutputSchemas {
        return this.schemas;
    }



}
