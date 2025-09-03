import { AvailableOperationKeys, TOperationSchemaObject, TZodShape } from '@/lib/schemasBuilder/types';
import z from 'zod';


/**
 * Generic config for the schema builder
 */
export interface SchemaBuilderConfig {
    base: TZodShape;
    raw: TZodShape;
    id: TZodShape;
    user: TZodShape;
}


/**
 * Parameters for the operation schema definition function
 */
export interface SchemaObjectFnParams<C extends SchemaBuilderConfig> {
    baseSchema: z.ZodObject<C['base']>;
    rawSchema: z.ZodObject<C['raw']>;
    idFieldsSchema: z.ZodObject<C['id']>;
    userFieldsSchema: z.ZodObject<C['user']>;
}


/**
 * Function that returns an object with schemas for query, service, and endpoint layers.
 */
export type OperationSchemaDefinitionFn<
    C extends SchemaBuilderConfig,
    TSchemasObject extends TOperationSchemaObject = TOperationSchemaObject,
> = (params: SchemaObjectFnParams<C>) => TSchemasObject;


/**
 * Builder class for operation schemas
 * @template C - The config
 * @template O - The output object with feature schemas
 */
export class OperationSchemaBuilder<C extends SchemaBuilderConfig, O extends Record<string, TOperationSchemaObject> = Record<string, TOperationSchemaObject>, TUsedKeys extends string = never,> {
    schemas: O;
    private baseSchema: z.ZodObject<C['base']>;
    private rawSchema: z.ZodObject<C['raw']>;
    private idFieldsSchema: z.ZodObject<C['id']>;
    private userFieldsSchema: z.ZodObject<C['user']>;



    constructor({ schemas, baseSchema, rawSchema, idFieldsSchema, userFieldsSchema }: { schemas: O, baseSchema: C['base'], rawSchema: C['raw'], idFieldsSchema: C['id'], userFieldsSchema: C['user'] }) {
        this.schemas = schemas;
        this.baseSchema = z.object(baseSchema);
        this.rawSchema = z.object(rawSchema);
        this.idFieldsSchema = z.object(idFieldsSchema);
        this.userFieldsSchema = z.object(userFieldsSchema);
    }


    /**
     * Adds an operation to the schemas object
     * @param key - The key of the operation
     * @param schemaObjectFn - The function that returns the schema object
     * @returns The updated schemas object
     */
    addOperation<K extends AvailableOperationKeys<TUsedKeys>, S extends TOperationSchemaObject>(key: K, schemaObjectFn: OperationSchemaDefinitionFn<C, S>): OperationSchemaBuilder<C, O & Record<K, S>, TUsedKeys | K> {

        const resultingOpSchema = schemaObjectFn({ baseSchema: this.baseSchema, rawSchema: this.rawSchema, idFieldsSchema: this.idFieldsSchema, userFieldsSchema: this.userFieldsSchema });


        return new OperationSchemaBuilder<C, O & Record<K, S>, TUsedKeys | K>({
            schemas: {
                ...this.schemas,
                [key]: resultingOpSchema,
            },
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idFieldsSchema: this.idFieldsSchema.shape,
            userFieldsSchema: this.userFieldsSchema.shape,
        });
    }

    build(): O {
        return this.schemas;
    }
}






