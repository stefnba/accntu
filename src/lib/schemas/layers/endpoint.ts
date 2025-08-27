import { ServiceFeatureSchema } from '@/lib/schemas/layers/service';
import { TLayerSchemas, TZodSchema } from '@/lib/schemas/types';

/**
 * Endpoint layer of the feature schema system - handles API request/response validation
 *
 * Features:
 * - Final layer that extends service schema with HTTP endpoint validation
 * - Validates API requests and responses at the network boundary
 * - Provides complete schema stack for full-stack type safety
 * - Ensures consistent validation across all application layers
 */
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

    /** Returns the endpoint schemas for direct access */
    getEndpointSchemas(): TEndpointSchemas {
        return this.endpointSchemas;
    }

    /** Builds the final schema object containing all four layers (base + query + service + endpoint) */
    build() {
        return {
            baseSchema: this.baseSchema,
            querySchemas: this.querySchemas,
            serviceSchemas: this.serviceSchemas,
            endpointSchemas: this.endpointSchemas,
        } as const;
    }
}
