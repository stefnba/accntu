import { TZodType } from '@/lib/validation';
import { Prettify } from '@/types/utils';
import { ValidationTargets } from 'hono';
import z from 'zod';

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
 * Handles Zod schemas (objects, arrays, etc.) and nested object structures.
 *
 * @template T - The input type to infer from
 */
export type InferFeatureSchemaObject<T> = T extends z.ZodTypeAny
    ? z.infer<T>
    : T extends object
      ? { [key in keyof T]: InferFeatureSchemaObject<T[key]> }
      : never;

/**
 * Recursively infers types for all entries in the given layer, including handling nested endpoint validation targets.
 *
 * @template T - The schema object returned by FeatureSchemasBuilder.build() (which is a TFeatureSchemas)
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
> = Prettify<{
    [K in keyof T as string extends K ? never : K]: InferFeatureSchemaObject<T[K][TLayer]>;
}>;

/**
 * Infers the type for a specific layer and operation from the feature schemas.
 *
 * @template TSchemaObject - The feature schemas object type
 * @template TLayer - The layer to infer ('service', 'query', etc.)
 * @template TOperation - The specific operation key (e.g., 'create', 'getById')
 *
 * @example
 * ```typescript
 * type CreateInput = InferSchemaByLayerAndOperation<typeof tagSchemas, 'service', 'create'>;
 * ```
 */
export type InferSchemaByLayerAndOperation<
    TSchemaObject extends TFeatureSchemas,
    TLayer extends keyof TFeatureSchemaObject,
    TOperation extends keyof TSchemaObject,
> = InferFeatureSchemaObject<TSchemaObject[TOperation][TLayer]>;
