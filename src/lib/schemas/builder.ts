import { TOperationSchemaObject, TZodObject, TZodShape } from '@/lib/schemas/types';
import z, { util } from 'zod';

type TUserSchema = z.ZodString | z.ZodNumber | never;

type MappingCoreServiceInput = {
    create: <S extends TZodObject, U extends TUserSchema>(params: {
        data: S;
        userFields?: U;
    }) => z.ZodObject<{ data: S; userId: U | TUserSchema }>;
    getById: <I extends TZodObject, U extends z.ZodString>(params: {
        idFields: I;
        userFields?: U;
    }) => z.ZodObject<{ id: I; userId: U | TUserSchema }>;
};

/**
 * Input helpers for the core service input
 */
const inputHelpers = <U extends TUserSchema>(defaults: { userId: U }): MappingCoreServiceInput => {
    return {
        create: (params) => {
            return z.object({
                data: params.data,
                userId: params.userFields || defaults.userId,
            });
        },
        getById: (params) => {
            return z.object({
                id: params.idFields,
                userId: params.userFields || defaults.userId,
            });
        },
    } as const;
};

export class BaseSchemaBuilderFactory<
    TFeatureSchemas extends Record<string, TOperationSchemaObject>,
    B extends TZodShape,
    R extends TZodShape = B,
    I extends TZodShape = TZodShape,
    U extends TZodShape = TZodShape,
> {
    schemas: TFeatureSchemas;
    baseSchema: z.ZodObject<B>;
    rawSchema: z.ZodObject<R>;
    idSchema: z.ZodObject<I>;
    userSchema: z.ZodObject<U>;

    constructor({
        baseSchema,
        rawSchema,
        idSchema,
        userSchema,
    }: {
        schemas: TFeatureSchemas;
        baseSchema: B;
        rawSchema?: B;
        idSchema?: I;
        userSchema?: U;
    });
    // overload 2: schemas
    constructor({
        baseSchema,
        rawSchema,
        idSchema,
        userSchema,
    }: {
        schemas: TFeatureSchemas;
        baseSchema: B;
        rawSchema: R;
        idSchema?: I;
        userSchema?: U;
    });
    // implement the constructor with all the overloads
    constructor({
        baseSchema,
        rawSchema,
        idSchema,
        userSchema,
        schemas,
    }: {
        baseSchema: B;
        rawSchema?: R;
        idSchema?: I;
        userSchema?: U;
        schemas: TFeatureSchemas;
    }) {
        this.schemas = schemas;
        this.baseSchema = z.object(baseSchema);
        this.rawSchema = z.object(rawSchema);
        this.idSchema = z.object(idSchema);
        this.userSchema = z.object(userSchema);
    }

    /**
     * Transform the schema
     */
    transform<TOut extends TZodShape>(transformer: (schema: z.ZodObject<B>) => z.ZodObject<TOut>) {
        return new BaseSchemaBuilderFactory<TFeatureSchemas, TOut, R, I, U>({
            schemas: this.schemas,
            baseSchema: transformer(this.baseSchema).shape,
            rawSchema: transformer(this.baseSchema).shape,
            userSchema: this.userSchema.shape,
            idSchema: this.idSchema.shape,
        });
    }

    /**
     * Pick fields from the schema
     */
    pick<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            schemas: this.schemas,
            baseSchema: this.baseSchema.pick(fields).shape,
            rawSchema: this.rawSchema.shape,
            userSchema: this.userSchema.shape,
            idSchema: this.idSchema.shape,
        });
    }

    /**
     * Omit fields from the schema
     */
    omit<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            schemas: this.schemas,
            baseSchema: this.baseSchema.omit(fields).shape,
            rawSchema: this.rawSchema.shape,
            userSchema: this.userSchema.shape,
            idSchema: this.idSchema.shape,
        });
    }

    /**
     * Add id fields to the schema
     */
    idFields<const Mask extends util.Mask<keyof R>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            schemas: this.schemas,
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.rawSchema.pick(fields).required().shape,
            userSchema: this.userSchema.shape,
        });
    }

    /**
     * Add id fields to the schema
     */
    userFields<const Mask extends util.Mask<keyof R>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            schemas: this.schemas,
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userSchema: this.rawSchema.pick(fields).required().shape,
        });
    }

    addCore<
        const K extends Exclude<keyof MappingCoreServiceInput, keyof TFeatureSchemas> & string,
        S extends TOperationSchemaObject,
    >(
        key: K,
        schemaObjectFn: (params: {
            baseSchema: z.ZodObject<B>;
            rawSchema: z.ZodObject<R>;
            idFieldsSchema: z.ZodObject<I>;
            userFieldsSchema: z.ZodObject<U>;
            buildServiceInput: MappingCoreServiceInput[K];
        }) => S
    ) {
        const wrappedSchemaObjectFn = schemaObjectFn({
            baseSchema: this.baseSchema,
            rawSchema: this.rawSchema,
            idFieldsSchema: this.idSchema,
            userFieldsSchema: this.userSchema,
            buildServiceInput: inputHelpers({ userId: z.string() })[key],
        });

        return new BaseSchemaBuilderFactory<TFeatureSchemas & Record<K, S>, B, R, I, U>({
            schemas: {
                ...this.schemas,
                [key]: wrappedSchemaObjectFn,
            },
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userSchema: this.userSchema.shape,
        });
    }
}
