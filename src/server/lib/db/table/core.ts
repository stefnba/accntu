import { COMMON_FIELDS } from '@/server/lib/db/table/config';

/**
 * Factory function to generate common table fields.
 * @param options - The options to generate the common table fields
 * @param options.exclude - The fields to exclude from the common table fields
 * @param options.include - The fields to include in the common table fields
 *
 *  @example
 * ```typescript
 * const tag = pgTable('tag', {
 *     ...createCommonTableFields(),
 *     name: text().notNull(),
 * });
 * ```
 */
export function createCommonTableFields<K extends keyof typeof COMMON_FIELDS>(options: {
    exclude: K[];
}): Omit<typeof COMMON_FIELDS, K>;
export function createCommonTableFields<K extends keyof typeof COMMON_FIELDS>(options: {
    include: K[];
}): Pick<typeof COMMON_FIELDS, K>;
export function createCommonTableFields(): typeof COMMON_FIELDS;
export function createCommonTableFields<K extends keyof typeof COMMON_FIELDS>(
    options: {
        exclude?: K[];
        include?: K[];
    } = {}
) {
    const { exclude, include } = options;

    // If include is specified, return only those fields
    if (include && include.length > 0) {
        const result = {} as Partial<typeof COMMON_FIELDS>;
        include.forEach((key) => {
            result[key] = COMMON_FIELDS[key];
        });
        return result;
    }

    // If exclude is specified, return all fields except those
    if (exclude && exclude.length > 0) {
        const result = { ...COMMON_FIELDS };
        for (const key of exclude) {
            delete result[key];
        }
        return result;
    }

    // No options provided, return all fields
    return COMMON_FIELDS;
}
