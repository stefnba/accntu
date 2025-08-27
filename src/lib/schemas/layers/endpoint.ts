import { ServiceFeatureSchema } from '@/lib/schemas/layers/service';
import { TLayerSchemas, TZodSchema } from '@/lib/schemas/types';

export class EndpointFeatureSchema<
    TBaseSchema extends TZodSchema,
    TQuerySchemas extends TLayerSchemas,
    TServiceSchemas extends TLayerSchemas,
    TEndpointSchemas extends TLayerSchemas,
> extends ServiceFeatureSchema<TBaseSchema, TQuerySchemas, TServiceSchemas> {
    endpointSchemas: TEndpointSchemas;

    constructor(
        baseSchema: TBaseSchema,
        querySchemas: TQuerySchemas,
        serviceSchemas: TServiceSchemas,
        endpointSchemas: TEndpointSchemas
    ) {
        super(baseSchema, querySchemas, serviceSchemas);
        this.endpointSchemas = endpointSchemas;
    }

    getEndpointSchemas(): TEndpointSchemas {
        return this.endpointSchemas;
    }

    // Build final schema with all layers
    build() {
        return {
            baseSchema: this.baseSchema,
            querySchemas: this.querySchemas,
            serviceSchemas: this.serviceSchemas,
            endpointSchemas: this.endpointSchemas,
        } as const;
    }
}
