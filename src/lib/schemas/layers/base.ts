import { QueryFeatureSchema } from '@/lib/schemas/layers/query';
import { QuerySchemaInput, TLayerSchemas, TZodSchema } from '@/lib/schemas/types';

/**
 * Base layer of the feature schema system - handles core entity validation
 *
 * Features:
 * - Wraps both processed and raw Zod schemas for the feature's main entity
 * - Provides foundation for building additional schema layers
 * - Enables fluent API for progressive schema enhancement
 * - Maintains access to both modified and original schemas
 */
export class BaseFeatureSchema<TBaseSchema extends TZodSchema, TRawSchema extends TZodSchema> {
    baseSchema: TBaseSchema;
    rawSchema: TRawSchema;

    constructor(baseSchema: TBaseSchema, rawSchema: TRawSchema) {
        this.baseSchema = baseSchema;
        this.rawSchema = rawSchema;
    }

    /**
     * Creates query layer schemas for database operations (get, list, create, update, delete)
     * @param querySchemaFn - Function that receives both base and raw schemas
     * @returns QueryFeatureSchema with base + query layers
     */
    createQuerySchema<TQuerySchemas extends TLayerSchemas>(
        querySchemaFn: (schemas: QuerySchemaInput<TBaseSchema, TRawSchema>) => TQuerySchemas
    ): QueryFeatureSchema<TBaseSchema, TRawSchema, TQuerySchemas> {
        return new QueryFeatureSchema(
            this.baseSchema,
            this.rawSchema,
            querySchemaFn({ base: this.baseSchema, raw: this.rawSchema })
        );
    }

    /** Returns the base schema for direct access */
    getBaseSchema(): TBaseSchema {
        return this.baseSchema;
    }

    /** Returns the raw schema for direct access */
    getRawSchema(): TRawSchema {
        return this.rawSchema;
    }

    /** Builds the final schema object containing only the base layer */
    build() {
        return {
            base: this.baseSchema,
            raw: this.rawSchema,
        } as const;
    }
}
