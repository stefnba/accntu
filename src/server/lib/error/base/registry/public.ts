import { typedEntries } from '@/lib/utils';
import {
    TPublicErrorRegistry,
    TPublicErrorRegistryOutput,
} from '@/server/lib/error/base/registry/types';

/**
 * Create a public error registry
 *
 * Transforms a public error registry object by enriching each error with:
 * - Explicit code field (key of the record)
 * - Auto-generated i18n key (if not provided)
 * - Type-safe output structure
 *
 * @template T - The public error registry type
 * @param records - Object containing public error definitions
 * @returns Transformed public error registry with enriched error objects
 *
 * @example
 * ```typescript
 * const publicErrors = createPublicErrorRecord({
 *   NOT_FOUND: {
 *     message: 'Resource not found',
 *     httpStatus: 404,
 *   },
 *   INVALID_INPUT: {
 *     message: 'Invalid input',
 *     httpStatus: 400,
 *     i18nKey: 'CUSTOM.INVALID_INPUT'
 *   }
 * });
 *
 * // Result:
 * // {
 * //   NOT_FOUND: {
 * //     code: 'NOT_FOUND',
 * //     message: 'Resource not found',
 * //     httpStatus: 404,
 * //     i18nKey: 'ERRORS.NOT_FOUND' // Auto-generated
 * //   },
 * //   INVALID_INPUT: {
 * //     code: 'INVALID_INPUT',
 * //     message: 'Invalid input',
 * //     httpStatus: 400,
 * //     i18nKey: 'CUSTOM.INVALID_INPUT' // Custom key preserved
 * //   }
 * // }
 * ```
 */
export const createPublicErrorRecord = <const T extends TPublicErrorRegistry>(records: T) => {
    const result: TPublicErrorRegistryOutput<T> = {} as TPublicErrorRegistryOutput<T>;

    for (const [key, value] of typedEntries(records)) {
        result[key] = {
            code: key,
            message: value.message,
            i18nKey: ('i18nKey' in value && value.i18nKey) || `ERRORS.${String(key)}`,
            httpStatus: 'httpStatus' in value ? value.httpStatus : undefined,
        } as TPublicErrorRegistryOutput<T>[typeof key];
    }

    return result;
};
