/**
 * Create a record of fields to omit from a Zod schema
 * @param fields - The fields to omit
 * @returns A record of fields to omit
 */
export const withZodOmitFields = <T extends string>(fields: readonly T[]): Record<T, true> => {
    return fields.reduce(
        (acc, field) => {
            acc[field] = true;
            return acc;
        },
        {} as Record<T, true>
    );
};
