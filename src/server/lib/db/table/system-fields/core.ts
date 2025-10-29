import { SYSTEM_FIELDS } from '@/server/lib/db/table/system-fields/config';

/**
 * Factory function to generate common table fields.
 * @param options - The options to generate the common table fields
 * @param options.exclude - The fields to exclude from the common table fields
 * @param options.include - The fields to include in the common table fields
 *
 *  @example
 * ```typescript
 * const tag = pgTable('tag', {
 *     ...createSystemTableFields(),
 *     name: text().notNull(),
 * });
 * ```
 */
export function createSystemTableFields<K extends keyof typeof SYSTEM_FIELDS>(options: {
    exclude: K[];
}): Omit<typeof SYSTEM_FIELDS, K>;
export function createSystemTableFields<K extends keyof typeof SYSTEM_FIELDS>(options: {
    include: K[];
}): Pick<typeof SYSTEM_FIELDS, K>;
export function createSystemTableFields(): typeof SYSTEM_FIELDS;
export function createSystemTableFields<K extends keyof typeof SYSTEM_FIELDS>(
    options: {
        exclude?: K[];
        include?: K[];
    } = {}
) {
    const { exclude, include } = options;

    // If include is specified, return only those fields
    if (include && include.length > 0) {
        const result = {} as Partial<typeof SYSTEM_FIELDS>;
        include.forEach((key) => {
            result[key] = SYSTEM_FIELDS[key];
        });
        return result;
    }

    // If exclude is specified, return all fields except those
    if (exclude && exclude.length > 0) {
        const result = { ...SYSTEM_FIELDS };
        for (const key of exclude) {
            delete result[key];
        }
        return result;
    }

    // No options provided, return all fields
    return SYSTEM_FIELDS;
}
