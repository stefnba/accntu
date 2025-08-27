import { QueryFeatureSchema } from '@/lib/schemas/layers/query';
import { TLayerSchemas, TZodSchema } from '@/lib/schemas/types';

/**
 * Base layer of the feature schema system - handles core entity validation
 *
 * Features:
 * - Wraps a primary Zod schema for the feature's main entity
 * - Provides foundation for building additional schema layers
 * - Enables fluent API for progressive schema enhancement
 */
export class BaseFeatureSchema<TBaseSchema extends TZodSchema> {
    baseSchema: TBaseSchema;

    constructor(baseSchema: TBaseSchema) {
        this.baseSchema = baseSchema;
    }

    /**
     * Creates query layer schemas for database operations (get, list, create, update, delete)
     * @param querySchemaFn - Function that receives base schema and returns query schemas
     * @returns QueryFeatureSchema with base + query layers
     */
    createQuerySchema<TQuerySchemas extends TLayerSchemas>(
        querySchemaFn: (baseSchema: TBaseSchema) => TQuerySchemas
    ): QueryFeatureSchema<TBaseSchema, TQuerySchemas> {
        return new QueryFeatureSchema(this.baseSchema, querySchemaFn(this.baseSchema));
    }

    /** Returns the base schema for direct access */
    getBaseSchema(): TBaseSchema {
        return this.baseSchema;
    }

    /** Builds the final schema object containing only the base layer */
    build() {
        return {
            baseSchema: this.baseSchema,
        } as const;
    }
}
