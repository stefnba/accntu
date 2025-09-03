import { BaseSchemaBuilderFactory } from "@/lib/schemas/builder-factory";
import { TZodObject } from "@/lib/schemas/types";
import { Table } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";



export class FeatureSchema {

    static fromSchemaObject<S extends TZodObject>(schema: S) {
        return new BaseSchemaBuilderFactory({ baseSchema: schema.shape, rawSchema: schema.shape });
    }


    /**
     * Creates feature schemas from a Drizzle table
     * @param table - The Drizzle table
     */
    static fromTable<T extends Table>(table: T) {
        const schema = createInsertSchema(table);
        return new BaseSchemaBuilderFactory({ baseSchema: schema.shape, rawSchema: schema.shape });
    }
}


/**
 * Alias for FeatureSchema class.
 */
export const createFeatureSchemas = {
    fromTable: FeatureSchema.fromTable,
    fromSchemaObject: FeatureSchema.fromSchemaObject,
};
