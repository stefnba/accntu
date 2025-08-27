import { TOperationSchemasObject, TZodSchema } from '@/lib/schemas/types';

/**
 * Base schema class that wraps Zod schemas for feature entities
 *
 * Core functionality:
 * - Holds both processed (base) and raw table schemas
 * - Provides forOperations() method to define operation-specific schemas
 * - Enables type-safe schema access (e.g., schemas.create.service)
 * - Supports dynamic schema creation with FeatureSchema.helpers.operation()
 */
export class BaseFeatureSchema<TBaseSchema extends TZodSchema, TRawSchema extends TZodSchema> {
    baseSchema: TBaseSchema;
    rawSchema: TRawSchema;

    constructor(baseSchema: TBaseSchema, rawSchema: TRawSchema) {
        this.baseSchema = baseSchema;
        this.rawSchema = rawSchema;
    }

    /**
     * Defines operation-specific schemas for the feature
     *
     * @param schemas - Function that receives base and raw schemas, returns operation definitions
     * @returns Object with operation schemas that can be accessed directly (e.g., result.create.service)
     *
     * @example
     * ```typescript
     * .forOperations(({ base }) => ({
     *   create: { service: base, endpoint: base },
     *   update: FeatureSchema.helpers.operation(() => {
     *     const shared = base.pick({ name: true });
     *     return { service: shared, endpoint: shared };
     *   })
     * }))
     * ```
     */
    forOperations<T extends TOperationSchemasObject>(
        schemas: (schemas: { base: TBaseSchema; raw: TRawSchema }) => T
    ): T {
        const operationSchemas = schemas({ base: this.baseSchema, raw: this.rawSchema });
        return operationSchemas;
    }
}
