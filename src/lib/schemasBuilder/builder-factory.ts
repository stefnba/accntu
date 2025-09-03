import { OperationSchemaBuilder } from '@/lib/schemasBuilder/builder';
import { TOperationSchemaObject, TZodShape } from '@/lib/schemasBuilder/types';
import z, { util } from 'zod';





export class BaseSchemaBuilderFactory<B extends TZodShape, R extends TZodShape = B, I extends TZodShape = TZodShape, U extends TZodShape = TZodShape> {
    baseSchema: z.ZodObject<B>;
    rawSchema: z.ZodObject<R>;
    idSchema: z.ZodObject<I>;
    userSchema: z.ZodObject<U>;

    constructor({ baseSchema, rawSchema, idSchema, userSchema }: { baseSchema: B, rawSchema?: B, idSchema?: I, userSchema?: U })
    constructor({ baseSchema, rawSchema, idSchema, userSchema }: { baseSchema: B, rawSchema: R, idSchema?: I, userSchema?: U })
    constructor({ baseSchema, rawSchema, idSchema, userSchema }: { baseSchema: B, rawSchema?: R, idSchema?: I, userSchema?: U }) {
        this.baseSchema = z.object(baseSchema);
        this.rawSchema = z.object(rawSchema);
        this.idSchema = z.object(idSchema);
        this.userSchema = z.object(userSchema);
    }


    /**
     * Transform the schema
     */
    transform<TOut extends TZodShape>(transformer: (schema: z.ZodObject<B>) => z.ZodObject<TOut>) {
        return new BaseSchemaBuilderFactory<TOut, R, I, U>({
            baseSchema: transformer(this.baseSchema).shape,
            rawSchema: transformer(this.baseSchema).shape,
        });
    }

    /**
     * Pick fields from the schema
     */
    pick<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.pick(fields).shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userSchema: this.userSchema.shape,
        });
    }

    /**
     * Omit fields from the schema
     */
    omit<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.omit(fields).shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.idSchema.shape,
            userSchema: this.userSchema.shape,
        });
    }

    /**
     * Add id fields to the schema
     */
    idFields<const Mask extends util.Mask<keyof R>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idSchema: this.rawSchema.pick(fields).required().shape,
            userSchema: this.userSchema.shape,
        });
    }

    /**
     * Add user fields to the schema
     */
    userFields<const Mask extends util.Mask<keyof R>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            userSchema: this.rawSchema.pick(fields).required().shape,
            idSchema: this.idSchema.shape,
        });
    }

    buildOpSchemas<TSchemas extends Record<string, TOperationSchemaObject>>(
        builderCallback: (builder: OperationSchemaBuilder<{ base: B, raw: R, id: I, user: U }>) => OperationSchemaBuilder<{ base: B, raw: R, id: I, user: U }, TSchemas, string>
    ) {
        const initialBuilder = new OperationSchemaBuilder<{ base: B, raw: R, id: I, user: U }>({
            schemas: {},
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idFieldsSchema: this.idSchema.shape,
            userFieldsSchema: this.userSchema.shape,
        });

        return builderCallback(initialBuilder).build()
    }






}



