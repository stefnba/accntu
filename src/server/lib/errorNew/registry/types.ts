import { TErrorLayer } from '@/server/lib/errorNew/error/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';

// ==================================================
// PRIVATE ERROR REGISTRY
// ==================================================

export type TErrorRegistryRecordDefinition = {
    /**
     * The human-readable error message
     */
    // message: string;
    /**
     * The public error record that can be returned to clients
     */
    public: TPublicErrorRegistryDefinition;
    /**
     * The HTTP status code that should be returned for this error
     */
    httpStatus?: ContentfulStatusCode;
    /**
     * Indicates whether this error is expected during normal operation.
     * Expected errors are business logic errors that can happen during normal operation (e.g., invalid input)
     * and don't include stack traces.
     */
    isExpected?: boolean;
    /**
     * The layers that this error can be thrown in.
     */
    layers?: Array<TErrorLayer>;
};

/**
 * Error registry record is a record with an error code as the key and an error registry record definition as the value.
 */
type TErrorRegistryRecord = Record<string, TErrorRegistryRecordDefinition>;

/**
 * Error registry is a record with an error category as the key and an error registry record as the value.
 */
export type TErrorRegistry = Record<string, TErrorRegistryRecord>;

/*
 * The output type for the error registry is a transformed version of the input type with the category and code added in addition to the other properties
 */
export type TErrorRegistryOutput<T extends TErrorRegistry> = {
    [Category in keyof T]: {
        [Code in keyof T[Category]]: {
            category: Category;
            code: Code;
        } & T[Category][Code];
    };
};

// ==================================================
// PRIVATE REGISTRY UTILITIES
// ==================================================

/**
 * Utility type that filters error codes from the registry where the layers array includes the given layer
 *
 * @example
 * ```typescript
 * type ServiceErrors = InferErrorCodesByLayer<typeof ERROR_REGISTRY, 'SERVICE'>;
 * // Result: "AUTH.ERROR" (assuming AUTH.ERROR has layers: ['SERVICE', 'ENDPOINT'])
 * ```
 */
export type InferErrorCodesByLayer<T extends TErrorRegistry, L extends TErrorLayer> = {
    [Category in keyof T]: {
        [ErrorCode in keyof T[Category]]: T[Category][ErrorCode] extends {
            layers: readonly (infer U)[];
        }
            ? L extends U
                ? TConcatedErrorCodes<Category, ErrorCode>
                : never
            : never;
    }[keyof T[Category]];
}[keyof T];

/**
 * Utility type that concatenates an error category and an error code into a fully qualified error key (e.g., 'AUTH.INVALID_TOKEN')
 */
export type TConcatedErrorCodes<
    Cat extends PropertyKey,
    Code extends PropertyKey,
> = `${Cat & string}.${Code & string}`;

/**
 * Utility type that infers the fully qualified error keys for a given error registry
 */
export type InferErrorKeys<T extends TErrorRegistry> = {
    [Category in keyof T]: {
        [Code in keyof T[Category]]: TConcatedErrorCodes<Category, Code>;
    }[keyof T[Category]];
}[keyof T];

/**
 * Utility type that gets the error definition from a given error key in the registry
 *
 * @example
 * ```typescript
 * type OperationError = InferErrorFromKey<typeof ERROR_REGISTRY, 'OPERATION.CREATE_FAILED'>;
 * // Result: { category: 'OPERATION', code: 'CREATE_FAILED', ... }
 * ```
 */
export type InferErrorFromKey<
    R extends TErrorRegistry,
    K extends InferErrorKeys<R>,
> = K extends `${infer Cat}.${infer Code}`
    ? Cat extends keyof R
        ? Code extends keyof R[Cat]
            ? R[Cat][Code]
            : never
        : never
    : never;

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
    httpStatus?: ContentfulStatusCode | undefined;
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
