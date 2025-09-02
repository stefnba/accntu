import { tag } from '@/server/db/schemas';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import z, { util } from 'zod';






type TZodShape = z.core.$ZodShape;

export class BaseSchemaBuilderFactory<B extends TZodShape, I extends TZodShape  = TZodShape, U extends TZodShape  = TZodShape> {
    baseSchema: z.ZodObject<B>;
    idSchema: z.ZodObject<I>;
    userSchema: z.ZodObject<U>;

    constructor({ baseSchema, idSchema, userSchema }: { baseSchema: B, idSchema?: I, userSchema?: U }) {
        this.baseSchema = z.object(baseSchema);
        this.idSchema = z.object(idSchema);
        this.userSchema = z.object(userSchema);
    }

    build() {
        return {
            baseSchema: this.baseSchema,
        };
    }

    /**
     * Transform the schema
     */
    transform<TOut extends TZodShape>(transformer: (schema: z.ZodObject<B>) => z.ZodObject<TOut>) {
        return new BaseSchemaBuilderFactory<TOut>({
            baseSchema: transformer(this.baseSchema).shape,

        });
    }

    /**
     * Pick fields from the schema
     */
    pick<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.pick(fields).shape,
        });
    }

    /**
     * Omit fields from the schema
     */
    omit<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.omit(fields).shape,
        });
    }

    /**
     * Add id fields to the schema
     */
    idFields<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.shape,
            idSchema: this.baseSchema.pick(fields).shape,
        });
    }

    /**
     * Add user fields to the schema
     */
    userFields<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.shape,
            userSchema: this.baseSchema.pick(fields).shape,
        });
    }


}

class TableFactory {
    static fromTable<T extends Table>(table: T) {
        const schema = createInsertSchema(table);
        return new BaseSchemaBuilderFactory({ baseSchema: schema.shape });
    }
}


const schemas = TableFactory.fromTable(tag).pick({ color: true }).transform(schema => schema.extend({ name: z.string(), userId: z.string() })).idFields({ color: true}).userFields({ userId: true })

const aa = schemas.idSchema
const bb = schemas.userSchema

type Schemas = z.infer<typeof schemas.userSchema>;

