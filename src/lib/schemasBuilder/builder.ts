import {
    OperationKeys,
    OperationSchemaDefinitionFn,
    TOperationSchemaObject,
    TZodSchema,
} from '@/lib/schemasBuilder/types';

export class SchemaObjectBuilder<
    TBaseSchema extends TZodSchema,
    TOutputSchemas extends Record<string, TOperationSchemaObject> = Record<
        string,
        TOperationSchemaObject
    >,
> {
    private schemas: TOutputSchemas;
    private baseSchema: TBaseSchema;
    // defineSchema = {
    //     endpoint: defineEndpointSchema,
    // };

    constructor({ schemas, baseSchema }: { schemas: TOutputSchemas; baseSchema: TBaseSchema }) {
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
    addOperation<K extends OperationKeys, S extends TOperationSchemaObject>(
        key: K,
        schemaFn: OperationSchemaDefinitionFn<TBaseSchema, S>
    ): SchemaObjectBuilder<TBaseSchema, TOutputSchemas & Record<K, S>>;

    // Overload 2: Direct schema input
    addOperation<K extends OperationKeys, S extends TOperationSchemaObject>(
        key: K,
        schema: S
    ): SchemaObjectBuilder<TBaseSchema, TOutputSchemas & Record<K, S>>;

    // Implementation
    addOperation<K extends OperationKeys, S extends TOperationSchemaObject>(
        key: K,
        schemaOrFn: S | OperationSchemaDefinitionFn<TBaseSchema, S>
    ): SchemaObjectBuilder<TBaseSchema, TOutputSchemas & Record<K, S>> {
        const resolvedSchema =
            typeof schemaOrFn === 'function'
                ? schemaOrFn({ baseSchema: this.baseSchema })
                : schemaOrFn;

        return new SchemaObjectBuilder<TBaseSchema, TOutputSchemas & Record<K, S>>({
            schemas: {
                ...this.schemas,
                [key]: resolvedSchema,
            },
            baseSchema: this.baseSchema,
        });
    }

    test() {}

    /**
     * Builds the final schemas object
     * @returns The final schemas object
     */
    build(): TOutputSchemas {
        return this.schemas;
    }
}

// const defineEndpointSchema = ({
//     id,
// }: {
//     id: TZodSchema;
// }): Record<keyof ValidationTargets, TZodSchema> => {
//     return {
//         json: id,
//     };
// };
