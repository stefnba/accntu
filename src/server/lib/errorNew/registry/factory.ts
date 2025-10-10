import { typedEntries } from '@/lib/utils';
import {
    TErrorRegistry,
    TErrorRegistryOutput,
    TPublicErrorRegistry,
    TPublicErrorRegistryOutput,
} from '@/server/lib/errorNew/registry/types';

/**
 * Create an error registry
 */
export function createErrorRegistry<const T extends TErrorRegistry>(
    errors: T
): TErrorRegistryOutput<T> {
    const result = Object.create(null);

    for (const [category, codes] of typedEntries(errors)) {
        const categoryResult = Object.create(null);

        for (const [code, value] of typedEntries(codes)) {
            categoryResult[code] = { ...value, category, code };
        }

        result[category] = categoryResult;
    }

    return result;
}

/**
 * Create a public error registry
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
