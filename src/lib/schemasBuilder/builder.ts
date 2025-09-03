import { CoreOperationKeys, TOperationSchemaObject, TZodObject, TZodShape } from '@/lib/schemasBuilder/types';
import z from 'zod';


/**
 * Generic config for the schema builder
 */
export interface SchemaBuilderConfig {
    base: TZodShape;
    raw: TZodShape;
    id: TZodShape;
}


/**
 * Parameters for the operation schema definition function
 */
export interface SchemaObjectFnParams<C extends SchemaBuilderConfig> {
    baseSchema: z.ZodObject<C['base']>;
    rawSchema: z.ZodObject<C['raw']>;
    idFieldsSchema: z.ZodObject<C['id']>;
    serviceInputBuilder: {
        create: <S extends TZodObject>(schema: S) => { data: S, idFields?: z.ZodObject<C['id']> }
        getById: () => { idFields: z.ZodObject<C['id']> }
        updateById: <S extends TZodObject>(schema: S) => { data: S, idFields: z.ZodObject<C['id']> }
        getMany: <S extends TZodObject>(filters?: S) => { filters?: S, pagination?: TZodObject, idFields?: z.ZodObject<C['id']> }
        removeById: () => { idFields: z.ZodObject<C['id']> }
    }
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
export class OperationSchemaBuilder<C extends SchemaBuilderConfig, O extends Record<string, TOperationSchemaObject> = Record<string, TOperationSchemaObject>, TUsedKeys extends string = never> {
    schemas: O;
    private baseSchema: z.ZodObject<C['base']>;
    private rawSchema: z.ZodObject<C['raw']>;
    private idFieldsSchema: z.ZodObject<C['id']>;



    constructor({ schemas, baseSchema, rawSchema, idFieldsSchema }: { schemas: O, baseSchema: C['base'], rawSchema: C['raw'], idFieldsSchema: C['id'] }) {
        this.schemas = schemas;
        this.baseSchema = z.object(baseSchema);
        this.rawSchema = z.object(rawSchema);
        this.idFieldsSchema = z.object(idFieldsSchema);
    }

    private serviceInputBuilder = {
        create: <S extends TZodObject>(schema: S) => {
            return {
                data: schema,
                idFields: this.idFieldsSchema
            }
        },
        getById: () => {
            return {
                idFields: this.idFieldsSchema,
            }
        },
        updateById: <S extends TZodObject>(schema: S) => {
            return {
                data: schema,
                idFields: this.idFieldsSchema
            }
        },
        getMany: <S extends TZodObject>(filters?: S) => {
            return {
                filters: filters,
                pagination: undefined,
                idFields: this.idFieldsSchema
            }
        },
        removeById: () => {
            return {
                idFields: this.idFieldsSchema,
            }
        }
    }


    /**
     * Adds an operation to the schemas object
     * @param key - The key of the operation
     * @param schemaObjectFn - The function that returns the schema object
     * @returns The updated schemas object
     */
    addOperation<K extends CoreOperationKeys | (string & {}), S extends TOperationSchemaObject<K>>(key: K, schemaObjectFn: OperationSchemaDefinitionFn<C, S>): OperationSchemaBuilder<C, O & Record<K, S>> {

        const resultingOpSchema = schemaObjectFn({ baseSchema: this.baseSchema, rawSchema: this.rawSchema, idFieldsSchema: this.idFieldsSchema, serviceInputBuilder: this.serviceInputBuilder });


        return new OperationSchemaBuilder<C, O & Record<K, S>>({
            schemas: {
                ...this.schemas,
                [key]: resultingOpSchema,
            },
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idFieldsSchema: this.idFieldsSchema.shape,
        });
    }

    /**
     * Builds the operation schemas
     * @returns The operation schemas
     */
    build(): { baseSchema: z.ZodObject<C['base']>, rawSchema: z.ZodObject<C['raw']>, idFieldsSchema: z.ZodObject<C['id']>, opSchemas: O } {
        return { baseSchema: this.baseSchema, rawSchema: this.rawSchema, idFieldsSchema: this.idFieldsSchema, opSchemas: this.schemas };
    }
}






