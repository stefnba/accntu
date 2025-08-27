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
    TRawSchema extends TZodSchema,
    TQuerySchemas extends TLayerSchemas,
> extends BaseFeatureSchema<TBaseSchema, TRawSchema> {
    querySchemas: TQuerySchemas;

    constructor(baseSchema: TBaseSchema, rawSchema: TRawSchema, querySchemas: TQuerySchemas) {
        super(baseSchema, rawSchema);
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
    ): ServiceFeatureSchema<TBaseSchema, TRawSchema, TQuerySchemas, TServiceSchemas> {
        return new ServiceFeatureSchema(
            this.baseSchema,
            this.rawSchema,
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
            base: this.baseSchema,
            raw: this.rawSchema,
            query: this.querySchemas,
        } as const;
    }
}
