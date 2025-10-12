import { TErrorLayer } from '@/server/lib/errorNew/error/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';

// ==================================================
// PRIVATE ERROR REGISTRY
// ==================================================

/**
 * Definition for a single error in the registry
 *
 * @property message - Human-readable error message (optional)
 * @property httpStatus - HTTP status code to return for this error (optional)
 * @property layers - Application layers where this error can be thrown (optional)
 * @property isExpected - Indicates whether this error is expected during normal operation (optional)
 * @property public - Public error definition (required)
 */
export type TErrorRegistryDefinition = Readonly<{
    message?: string;
    httpStatus?: ContentfulStatusCode;
    layers?: ReadonlyArray<TErrorLayer>;
    isExpected: boolean;
    public: TPublicErrorRegistryDefinition;
}>;

/**
 * Structure of the error registry object
 *
 * A nested object where:
 * - First level keys are categories (e.g., 'AUTH', 'VALIDATION')
 * - Second level keys are error codes (e.g., 'INVALID_TOKEN', 'MISSING_FIELD')
 * - Values are error definitions
 *
 * @example
 * ```typescript
 * const registry = {
 *   AUTH: {
 *     INVALID_TOKEN: { message: 'Invalid token', httpStatus: 401 }
 *   }
 * }
 * ```
 */
export type TErrorRegistryObject = Readonly<
    Record<string, Readonly<Record<string, TErrorRegistryDefinition>>>
>;

// ==================================================
// UTILITIES
// ==================================================

/**
 * Infer all possible error keys from a registry object
 *
 * Transforms nested structure into flat dot-notation keys
 *
 * @example
 * ```typescript
 * type Registry = { AUTH: { INVALID_TOKEN: {...} } }
 * type Keys = InferErrorKeys<Registry>
 * // Result: "AUTH.INVALID_TOKEN"
 * ```
 */
export type InferErrorKeys<R extends TErrorRegistryObject> = {
    [K in keyof R & string]: { [S in keyof R[K] & string]: `${K}.${S}` }[keyof R[K] & string];
}[keyof R & string];

/**
 * Extract error definition for a specific key from the registry
 *
 * Splits dot-notation key into category and code, then retrieves the definition
 *
 * @example
 * ```typescript
 * type Registry = { AUTH: { INVALID_TOKEN: { message: 'Invalid' } } }
 * type Def = InferErrorDefinitionFromKey<Registry, 'AUTH.INVALID_TOKEN'>
 * // Result: { message: 'Invalid' }
 * ```
 */
export type InferErrorDefinitionFromKey<
    R extends TErrorRegistryObject,
    K extends string,
> = K extends `${infer Category}.${infer Code}`
    ? Category extends keyof R
        ? Code extends keyof R[Category]
            ? R[Category][Code]
            : never
        : never
    : never;

/**
 * Union of all error definitions in a registry
 *
 * Used internally for Map value type - avoids recomputing complex conditional type
 */
export type FlattenedRegistryValue<R extends TErrorRegistryObject> = InferErrorDefinitionFromKey<
    R,
    InferErrorKeys<R>
>;

/**
 * Extract all possible error keys from a registry object
 *
 * Helper type that avoids circular reference to ErrorRegistry class.
 * Use this when you need to extract keys from typeof ERROR_REGISTRY.registry
 *
 * @example
 * ```typescript
 * type Keys = InferErrorKeysFromRegistry<typeof ERROR_REGISTRY.registry>
 * // Result: "AUTH.INVALID_TOKEN" | "VALIDATION.INVALID_FORMAT" | ...
 * ```
 */
export type InferErrorKeysFromRegistry<R extends TErrorRegistryObject> = InferErrorKeys<R>;

/**
 * Extract all category names from a registry object
 *
 * Helper type that avoids circular reference to ErrorRegistry class.
 * Use this when you need to extract categories from typeof ERROR_REGISTRY.registry
 *
 * @example
 * ```typescript
 * type Categories = InferErrorCategoriesFromRegistry<typeof ERROR_REGISTRY.registry>
 * // Result: "AUTH" | "VALIDATION" | "RESOURCE" | ...
 * ```
 */
export type InferErrorCategoriesFromRegistry<R extends TErrorRegistryObject> = keyof R;

/**
 * Build a fully qualified error key from category and code
 *
 * @example
 * ```typescript
 * type Key = TBuildErrorKey<'AUTH', 'INVALID_TOKEN'>
 * // Result: "AUTH.INVALID_TOKEN"
 * ```
 */
export type TBuildErrorKey<
    Cat extends PropertyKey,
    Code extends PropertyKey,
> = `${Cat & string}.${Code & string}`;

/**
 * Filter error codes from registry by layer
 *
 * Returns union of error keys that include the specified layer in their layers array
 *
 * @example
 * ```typescript
 * type AuthErrors = InferErrorCodesByLayer<typeof ERROR_REGISTRY.registry, 'AUTH'>
 * // Result: "PERMISSION.NOT_AUTHORIZED" | "PERMISSION.ACCESS_DENIED" | ...
 * ```
 */
export type InferErrorCodesByLayer<R extends TErrorRegistryObject, L extends TErrorLayer> = {
    [Category in keyof R]: {
        [ErrorCode in keyof R[Category]]: R[Category][ErrorCode] extends {
            layers: readonly (infer U)[];
        }
            ? L extends U
                ? TBuildErrorKey<Category, ErrorCode>
                : never
            : never;
    }[keyof R[Category]];
}[keyof R];

// ==================================================
// PUBLIC ERROR REGISTRY
// ==================================================

/**
 * The definition of a public error registry
 */
export type TPublicErrorRegistryDefinition = {
    /** Default human text (fallback). Prefer using i18nKey on the client. */
    message?: string;
    /** The HTTP status code that should be returned for this error. Override the internal status code. */
    httpStatus: ContentfulStatusCode;
    /** i18n lookup key used by the frontend. */
    i18nKey?: string;
};

/**
 * The public error record is a record of public error definitions with the error code as the key and the public error definition as the value
 */
export type TPublicErrorRegistry = Record<string, TPublicErrorRegistryDefinition>;

/**
 * The output type for the public error registry is a transformed version of the input type with the code added in addition to the message
 */
export type TPublicErrorRegistryOutput<T extends TPublicErrorRegistry> = {
    [K in keyof T]: Readonly<{
        code: K;
        /** Default human text (fallback). Prefer using i18nKey on the client. */
        message: T[K]['message'] extends string ? T[K]['message'] : undefined;
        /** i18n lookup key used by the frontend. */
        i18nKey: T[K]['i18nKey'] extends string ? T[K]['i18nKey'] : `ERRORS.${K & string}`;
        /** The HTTP status code that should be returned for this error. Override the internal status code. */
        httpStatus: T[K]['httpStatus'] extends ContentfulStatusCode
            ? T[K]['httpStatus']
            : undefined;
    }>;
};
