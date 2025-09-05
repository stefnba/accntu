import { inputHelpers } from '@/lib/schemas/helpers';
import { MappingCoreServiceInput, TOperationSchemaObject, TZodShape } from '@/lib/schemas/types';
import z, { util } from 'zod';

export class BaseSchemaBuilder<
    TFeatureSchemas extends Record<string, TOperationSchemaObject>,
    B extends TZodShape,
    R extends TZodShape = B,
    I extends TZodShape = TZodShape,
    const U extends keyof R & string = never,
> {
    schemas: TFeatureSchemas;
    baseSchema: z.ZodObject<B>;
    rawSchema: z.ZodObject<R>;
    idSchema: z.ZodObject<I>;
    userIdField: U;

    constructor({
        baseSchema,
        rawSchema,
        idSchema,
        userIdField,
    }: {
        schemas: TFeatureSchemas;
        baseSchema: B;
        rawSchema?: B;
        idSchema?: I;
        userIdField?: U;
    });
    // overload 2: schemas
    constructor({
        baseSchema,
        rawSchema,
        idSchema,
        userIdField,
    }: {
        schemas: TFeatureSchemas;
        baseSchema: B;
        rawSchema: R;
        idSchema?: I;
        userIdField: U;
    });
    // implement the constructor with all the overloads
    constructor({
        baseSchema,
        rawSchema,
        idSchema,
        userIdField,
        schemas,
    }: {
        baseSchema: B;
        rawSchema?: R;
        idSchema?: I;
        userIdField: U;
        schemas: TFeatureSchemas;
    }) {
        this.schemas = schemas;
        this.baseSchema = z.object(baseSchema);
        this.rawSchema = z.object(rawSchema);
        this.idSchema = z.object(idSchema);
        this.userIdField = userIdField;
    }

    /**
     * Transform the schema
     */
    transform<TOut extends TZodShape>(transformer: (schema: z.ZodObject<B>) => z.ZodObject<TOut>) {
        return new BaseSchemaBuilder<TFeatureSchemas, TOut, R, I, U>({
            schemas: this.schemas,
            baseSchema: transformer(this.baseSchema).shape,
            rawSchema: transformer(this.baseSchema).shape,
            userIdField: this.userIdField,
            idSchema: this.idSchema.shape,
        });
    }

    /**
     * Pick fields from the schema
     */
    pick<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilder({
            schemas: this.schemas,
            baseSchema: this.baseSchema.pick(fields).shape,
            rawSchema: this.rawSchema.shape,
            userIdField: this.userIdField,
            idSchema: this.idSchema.shape,
        });
    }

    /**
     * Omit fields from the schema
     */
    omit<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilder({
            schemas: this.schemas,
            baseSchema: this.baseSchema.omit(fields).shape,
            rawSchema: this.rawSchema.shape,
            userIdField: this.userIdField,
            idSchema: this.idSchema.shape,
        });
    }

    /**
     * Add id fields to the schema
     */
    idFields<const Mask extends util.Mask<keyof R>>(fields: Mask) {
        return new BaseSchemaBuilder({
            schemas: this.schemas,
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.rawSchema.pick(fields).required().shape,
            userIdField: this.userIdField,
        });
    }

    userField<const TKey extends keyof R & string>(field: TKey) {
        return new BaseSchemaBuilder<TFeatureSchemas, B, R, I, TKey>({
            schemas: this.schemas,
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userIdField: field,
        });
    }

    addCore<
        const K extends Exclude<keyof MappingCoreServiceInput<R[U]>, keyof TFeatureSchemas> &
            string,
        S extends TOperationSchemaObject,
    >(
        key: K,
        schemaObjectFn: (params: {
            baseSchema: z.ZodObject<B>;
            rawSchema: z.ZodObject<R>;
            idFieldsSchema: z.ZodObject<I>;
            userIdField: R[U];
            buildServiceInput: MappingCoreServiceInput<R[U], z.ZodObject<I>>[K];
        }) => S
    ) {
        const userIdField = this.rawSchema.shape[this.userIdField];

        const wrappedSchemaObjectFn = schemaObjectFn({
            baseSchema: this.baseSchema,
            rawSchema: this.rawSchema,
            idFieldsSchema: this.idSchema,
            userIdField: userIdField,
            buildServiceInput: inputHelpers({ userId: userIdField, ids: this.idSchema })[key],
        });

        return new BaseSchemaBuilder<TFeatureSchemas & Record<K, S>, B, R, I, U>({
            schemas: {
                ...this.schemas,
                [key]: wrappedSchemaObjectFn,
            },
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userIdField: this.userIdField,
        });
    }

    addCustom<const K extends string, S extends TOperationSchemaObject>(
        key: K,
        schemaObjectFn: (params: {
            baseSchema: z.ZodObject<B>;
            rawSchema: z.ZodObject<R>;
            idFieldsSchema: z.ZodObject<I>;
            userIdField: R[U];
        }) => S
    ) {
        const userIdField = this.rawSchema.shape[this.userIdField];
        const wrappedSchemaObjectFn = schemaObjectFn({
            baseSchema: this.baseSchema,
            rawSchema: this.rawSchema,
            idFieldsSchema: this.idSchema,
            userIdField: userIdField,
        });

        return new BaseSchemaBuilder<TFeatureSchemas & Record<K, S>, B, R, I, U>({
            schemas: {
                ...this.schemas,
                [key]: wrappedSchemaObjectFn,
            },
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userIdField: this.userIdField,
        });
    }
}
