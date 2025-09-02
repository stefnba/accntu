import { TZodSchema } from '@/lib/schemasBuilder/types';
import { tag } from '@/server/db/schemas';
import { Table } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import z, { util } from 'zod';

type StringKeys<T> = Extract<keyof T, string>;

type PickedZodSchema<
    TSchema extends TZodSchema,
    TMask extends util.Mask<StringKeys<TSchema['shape']>>
> = z.ZodObject<Pick<TSchema['shape'], Extract<StringKeys<TMask>, keyof TSchema['shape']>>>;


type TZodShape = z.core.$ZodShape;

export class BaseSchemaBuilderFactory<B extends TZodShape> {
    baseSchema: z.ZodObject<B>;

    constructor({ baseSchema }: { baseSchema: B }) {
        this.baseSchema = z.object(baseSchema);
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

    pick<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.pick(fields).shape,
        });
    }

    omit<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.omit(fields).shape,
        });
    }

    idFields<const Mask extends util.Mask<keyof B>>(fields: Mask) {
        return new BaseSchemaBuilderFactory({
            baseSchema: this.baseSchema.pick(fields).shape,
        });
    }

}

class TableFactory {
    static fromTable<T extends Table>(table: T) {
        const schema = createInsertSchema(table);
        return new BaseSchemaBuilderFactory({ baseSchema: schema.shape });
    }
}

const schemas = TableFactory.fromTable(tag).pick({ color: true }).transform(schema => schema.extend({ name: z.string() }));

type Schemas = z.infer<typeof schemas.baseSchema>;


const a =  new BaseSchemaBuilderFactory({ baseSchema: { name: z.string(), number: z.number(), test: z.string() } }).omit({ name: true });
const b = a.omit({ number: true });
type B = z.infer<typeof b.baseSchema>;

