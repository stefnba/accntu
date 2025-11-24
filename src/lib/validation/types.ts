import { z } from 'zod';

/**
 * Type constraint for all Zod shapes used in the layer system. This is more flexible than TZodObject.
 */
export type TZodShape = z.ZodRawShape;

export type TZodArray<T extends TZodType = TZodType> = z.ZodArray<T>;

/**
 * Type constraint for all Zod objects used in the layer system
 */
export type TZodObject<T extends TZodShape = TZodShape> = z.ZodObject<T>;

/**
 * Type constraint for all Zod types used in the layer system. This is using zod core since z.ZodType is not working.
 */
export type TZodType = z.core.$ZodType;

/**
 * Defines a Zod shape constrained to a specific set of keys `K`.
 * This validates that `S` only contains keys from `K`, and that all values are `TZodType` (no undefined).
 */
export type TZodPartialShape<K extends PropertyKey, S> = {
    [k in keyof S]: k extends K ? TZodType : never;
};

/**
 * Sentinel value representing an empty Zod schema.
 *
 * **Why use this instead of `undefined`?**
 * Using `Record<never, never>` enables zero-assertion type safety by ensuring
 * `keyof TEmptySchema` evaluates to `never`. This allows type guards and conditional
 * types to work correctly without runtime type assertions.
 */
export type TEmptySchema = Readonly<Record<never, never>>;
