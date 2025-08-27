import { BaseFeatureSchema } from '@/lib/schemas/layers/base';
import { ServiceFeatureSchema } from '@/lib/schemas/layers/service';
import { TLayerSchemas, TZodSchema } from '@/lib/schemas/types';

/**
 * Query layer of the feature schema system - handles database operation validation
 *
 * Features:
 * - Extends base schema with query-specific validation schemas
 * - Typically includes: get, list, create, update, delete schemas
 * - Provides foundation for service layer schemas
 * - Maintains type safety across query operations
 */
export class QueryFeatureSchema<
    TBaseSchema extends TZodSchema,
    TQuerySchemas extends TLayerSchemas,
> extends BaseFeatureSchema<TBaseSchema> {
    querySchemas: TQuerySchemas;

    constructor(baseSchema: TBaseSchema, querySchemas: TQuerySchemas) {
        super(baseSchema);
        this.querySchemas = querySchemas;
    }

    /**
     * Creates service layer schemas for business logic validation
     * @param serviceSchemaFn - Function that receives query schemas and returns service schemas
     * @returns ServiceFeatureSchema with base + query + service layers
     */
    createServiceSchema<
        TServiceSchemasKeys extends keyof TQuerySchemas,
        TServiceSchemas extends TLayerSchemas<TServiceSchemasKeys>,
    >(
        serviceSchemaFn: (querySchemas: TQuerySchemas) => TServiceSchemas
    ): ServiceFeatureSchema<TBaseSchema, TQuerySchemas, TServiceSchemas> {
        return new ServiceFeatureSchema(
            this.baseSchema,
            this.querySchemas,
            serviceSchemaFn(this.querySchemas)
        );
    }

    /** Returns the query schemas for direct access */
    getQuerySchemas(): TQuerySchemas {
        return this.querySchemas;
    }

    /** Builds the final schema object containing base + query layers */
    build() {
        return {
            baseSchema: this.baseSchema,
            querySchemas: this.querySchemas,
        } as const;
    }
}
