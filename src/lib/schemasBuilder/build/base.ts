import { TZodShape } from '@/lib/schemasBuilder/build/types';
import { tag } from '@/server/db/schemas';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import z, { util } from 'zod';








export class BaseSchemaBuilderFactory<B extends TZodShape, R extends TZodShape  = B, I extends TZodShape  = TZodShape, U extends TZodShape  = TZodShape> {
    baseSchema: z.ZodObject<B>;
    rawSchema: z.ZodObject<R | B>;
    idSchema: z.ZodObject<I>;
    userSchema: z.ZodObject<U>;

    constructor({ baseSchema, rawSchema, idSchema, userSchema }: { baseSchema: B, rawSchema?: B, idSchema?: I, userSchema?: U })
    constructor({ baseSchema, rawSchema, idSchema, userSchema }: { baseSchema: B, rawSchema: R, idSchema?: I, userSchema?: U })
    constructor({ baseSchema, rawSchema, idSchema, userSchema }: { baseSchema: B, rawSchema?: R | B, idSchema?: I, userSchema?: U }) {
        this.baseSchema = z.object(baseSchema);
        this.rawSchema = z.object(rawSchema);
        this.idSchema = z.object(idSchema);
        this.userSchema = z.object(userSchema);
    }



    /**
     * Transform the schema
     */
    transform<TOut extends TZodShape>(transformer: (schema: z.ZodObject<B>) => z.ZodObject<TOut>) {
        return new BaseSchemaBuilderFactory<TOut, R>({
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
        });
    }

    /**
     * Omit fields from the schema
     */
    omit<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.omit(fields).shape,
            rawSchema: this.rawSchema.shape,
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

    /**
     * Add user fields to the schema
     */
    userFields<const Mask extends util.Mask<keyof R>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
            userSchema: this.rawSchema.pick(fields).required().shape,
        });
    }

    buildOpsSchemas(builderCallback: (builder: OperationSchemaBuilder<{base: B, raw: R}>) => OperationSchemaBuilder<{base: B, raw: R}>) {
        const initialBuilder = new OperationSchemaBuilder<{base: B, raw: R}>({
            schemas: {},
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
        });

        return builderCallback(initialBuilder).build();
    }


}

class OperationSchemaBuilder<S extends {base: TZodShape, raw: TZodShape}, O extends Record<string, TZodShape> = Record<string, TZodShape>> {
    private schemas: O;
    private baseSchema: z.ZodObject<S['base']>;
    private rawSchema: z.ZodObject<S['raw']>;
    constructor({schemas, baseSchema, rawSchema}: {schemas: O, baseSchema: S['base'], rawSchema: S['raw']}) {
        this.schemas = schemas;
        this.baseSchema = z.object(baseSchema);
        this.rawSchema = z.object(rawSchema);
    }

    addOperation<K extends string>(key: K, schemaObject: ({ baseSchema, rawSchema }: { baseSchema: z.ZodObject<S['base']>, rawSchema: z.ZodObject<S['raw']> }) => z.ZodObject<TZodShape>) {

        const schema = schemaObject({ baseSchema: this.baseSchema, rawSchema: this.rawSchema });


        return new OperationSchemaBuilder<S, O & Record<K, TZodShape>>({
            schemas: {
                ...this.schemas,
                [key]: schema,
            },
            baseSchema: this.baseSchema.shape,
            rawSchema: this.rawSchema.shape,
        });
    }

    build(): O {
        return this.schemas;
    }
}

class TableFactory {
    static fromTable<T extends Table>(table: T) {
        const schema = createInsertSchema(table);
        return new BaseSchemaBuilderFactory({ baseSchema: schema.shape, rawSchema: schema.shape });
    }
}





const schemas = TableFactory.fromTable(tag).pick({ id: true})

// .userFields({ id: true }).idFields({ id: true })
// .idFields({ id: true})

// .pick({ id: true }).idFields({ id: true }).transform(schema => schema.extend({ name: z.string(), userId: z.string() }))
// .buildOpsSchemas(builder => builder.addOperation('create', ({ baseSchema, rawSchema }) => {return baseSchema.extend({ name: z.string(), userId: z.string() })}))
const aa = schemas.baseSchema
// const bb = schemas.userSchema

type Schemas = z.infer<typeof schemas.baseSchema>;

