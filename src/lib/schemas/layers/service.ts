import { EndpointFeatureSchema } from '@/lib/schemas/layers/endpoint';
import { QueryFeatureSchema } from '@/lib/schemas/layers/query';
import { TLayerSchemas, TZodSchema } from '@/lib/schemas/types';

/**
 * Service layer of the feature schema system - handles business logic validation
 *
 * Features:
 * - Extends query schema with service-specific validation schemas
 * - Validates business logic operations and transformations
 * - Provides foundation for endpoint layer schemas
 * - Ensures type safety for service function inputs/outputs
 */
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

    /**
     * Creates endpoint layer schemas for API request/response validation
     * @param endpointSchemaFn - Function that receives service schemas and returns endpoint schemas
     * @returns EndpointFeatureSchema with all four layers (base + query + service + endpoint)
     */
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

    /** Returns the service schemas for direct access */
    getServiceSchemas(): TServiceSchemas {
        return this.serviceSchemas;
    }

    /** Builds the final schema object containing base + query + service layers */
    build() {
        return {
            baseSchema: this.baseSchema,
            querySchemas: this.querySchemas,
            serviceSchemas: this.serviceSchemas,
        } as const;
    }
}
