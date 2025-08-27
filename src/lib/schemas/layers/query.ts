import { BaseFeatureSchema } from '@/lib/schemas/layers/base';
import { ServiceFeatureSchema } from '@/lib/schemas/layers/service';
import { TLayerSchemas, TZodSchema } from '@/lib/schemas/types';

export class QueryFeatureSchema<
    TBaseSchema extends TZodSchema,
    TQuerySchemas extends TLayerSchemas,
> extends BaseFeatureSchema<TBaseSchema> {
    querySchemas: TQuerySchemas;

    constructor(baseSchema: TBaseSchema, querySchemas: TQuerySchemas) {
        super(baseSchema);
        this.querySchemas = querySchemas;
    }

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

    getQuerySchemas(): TQuerySchemas {
        return this.querySchemas;
    }

    // Build final schema with base + query
    build() {
        return {
            baseSchema: this.baseSchema,
            querySchemas: this.querySchemas,
        } as const;
    }
}
