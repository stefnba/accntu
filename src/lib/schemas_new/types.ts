import { ValidationTargets } from 'hono';
import z from 'zod';

/**
 * Type constraint for all Zod shapes used in the layer system. This is more flexible than TZodObject.
 */
export type TZodShape = z.ZodRawShape;

/**
 * Type constraint for all Zod objects used in the layer system
 */
export type TZodObject<T extends TZodShape = TZodShape> = z.ZodObject<T>;

/**
 * Type constraint for all Zod types used in the layer system. This is using zod core since z.ZodType is not working.
 */
export type TZodType = z.core.$ZodType;

/**
 * Endpoint schema object supporting Hono validation targets
 * Each target is optional to allow flexible endpoint definitions
 */
export type TEndpointSchemaObject = Partial<Record<keyof ValidationTargets, TZodType>>;

/**
 * Object with schemas for query, service, and endpoint layers.
 * The endpoint layer supports Hono validation targets (json, query, param, etc.)
 */
export type TFeatureSchemaObject = {
    query?: TZodType;
    service?: TZodType | Record<string, TZodType>;
    endpoint?: TEndpointSchemaObject;
    form?: TZodType;
};

/**
 * Result of building operation schemas for a feature
 */
export type TFeatureSchemas = Record<string, TFeatureSchemaObject>;

// ====================
// Infer
// ====================

/**
 * Recursively infer types from schema objects or nested structures.
 * Handles both Zod objects and nested object structures.
 *
 * @template T - The input type to infer from
 */
export type InferFeatureSchemaObject<T> = T extends z.ZodObject
    ? z.infer<T>
    : T extends object
      ? { [key in keyof T]: InferFeatureSchemaObject<T[key]> }
      : never;

/**
 * Recursively infers types for all entries in the given layer, including handling nested endpoint validation targets.
 *
 * @template T - The TFeatureSchemas object containing all feature schema definitions
 * @template TLayer - The key of the schema layer to extract and infer ('query', 'service', 'endpoint', 'form')
 * @returns Mapped type with inferred types for each item in the specified layer
 *
 * @example
 * ```typescript
 * type TagServices = InferSchemasByLayer<typeof tagSchemas, 'service'>;
 * type CreateService = TagServices['create']; // z.infer<service schema>
 * type TagEndpoints = InferSchemasByLayer<typeof tagSchemas, 'endpoint'>;
 * type CreateEndpointJson = TagEndpoints['create']['json']; // z.infer<endpoint json schema>
 * ```
 */
export type InferSchemasByLayer<
    T extends TFeatureSchemas,
    TLayer extends keyof TFeatureSchemaObject,
> = {
    [K in keyof T]: InferFeatureSchemaObject<T[K][TLayer]>;
};
