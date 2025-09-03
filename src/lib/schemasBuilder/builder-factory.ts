import { OperationSchemaBuilder } from '@/lib/schemasBuilder/builder';
import { TOperationSchemaObject, TZodShape } from '@/lib/schemasBuilder/types';
import z, { util } from 'zod';





export class BaseSchemaBuilderFactory<B extends TZodShape, R extends TZodShape = B, I extends TZodShape = TZodShape> {
    baseSchema: z.ZodObject<B>;
    rawSchema: z.ZodObject<R>;
    idSchema: z.ZodObject<I>;

    constructor({ baseSchema, rawSchema, idSchema }: { baseSchema: B, rawSchema?: B, idSchema?: I })
    constructor({ baseSchema, rawSchema, idSchema }: { baseSchema: B, rawSchema: R, idSchema?: I })
    constructor({ baseSchema, rawSchema, idSchema }: { baseSchema: B, rawSchema?: R, idSchema?: I }) {
        this.baseSchema = z.object(baseSchema);
        this.rawSchema = z.object(rawSchema);
        this.idSchema = z.object(idSchema);
    }


    /**
     * Transform the schema
     */
    transform<TOut extends TZodShape>(transformer: (schema: z.ZodObject<B>) => z.ZodObject<TOut>) {
        return new BaseSchemaBuilderFactory<TOut, R, I>({
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
        });
    }


    buildOpSchemas<TSchemas extends Record<string, TOperationSchemaObject>>(
        builderCallback: (builder: OperationSchemaBuilder<{ base: B, raw: R, id: I }>) => OperationSchemaBuilder<{ base: B, raw: R, id: I }, TSchemas, string>
    ) {
        const initialBuilder = new OperationSchemaBuilder<{ base: B, raw: R, id: I }>({
            schemas: {},
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            idFieldsSchema: this.idSchema.shape,
        });

        return builderCallback(initialBuilder).build()
    }






}



