import { EndpointFeatureSchema } from '@/lib/schemas/layers/endpoint';
import { QueryFeatureSchema } from '@/lib/schemas/layers/query';
import { TLayerSchemas, TZodSchema } from '@/lib/schemas/types';

export class ServiceFeatureSchema<
    TBaseSchema extends TZodSchema,
    TQuerySchemas extends TLayerSchemas,
    TServiceSchemas extends TLayerSchemas,
> extends QueryFeatureSchema<TBaseSchema, TQuerySchemas> {
    serviceSchemas: TServiceSchemas;

    constructor(
        baseSchema: TBaseSchema,
        querySchemas: TQuerySchemas,
        serviceSchemas: TServiceSchemas
    ) {
        super(baseSchema, querySchemas);
        this.serviceSchemas = serviceSchemas;
    }

    createEndpointSchema<
        TEndpointSchemasKeys extends keyof TServiceSchemas,
        TEndpointSchemas extends TLayerSchemas<TEndpointSchemasKeys>,
    >(
        endpointSchemaFn: (serviceSchemas: TServiceSchemas) => TEndpointSchemas
    ): EndpointFeatureSchema<TBaseSchema, TQuerySchemas, TServiceSchemas, TEndpointSchemas> {
        return new EndpointFeatureSchema(
            this.baseSchema,
            this.querySchemas,
            this.serviceSchemas,
            endpointSchemaFn(this.serviceSchemas)
        );
    }

    getServiceSchemas(): TServiceSchemas {
        return this.serviceSchemas;
    }

    // Build final schema with base + query + service
    build() {
        return {
            baseSchema: this.baseSchema,
            querySchemas: this.querySchemas,
            serviceSchemas: this.serviceSchemas,
        } as const;
    }
}
