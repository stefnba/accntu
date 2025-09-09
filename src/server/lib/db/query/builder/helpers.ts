import { typedEntries } from '@/lib/utils';
import { Table } from 'drizzle-orm';

/*
 * Helper function to add the user id identifier to the identifiers.
 * If the userIdField is not provided, no identifier will be added.
 */
export const userIdIdentifier = (
    userIdField: string | number | symbol | undefined,
    input: Record<string | number, unknown>
) => {
    if (!userIdField) return [];
    if (!input) return [];

    return userIdField in input && typeof userIdField === 'string' && input[userIdField]
        ? [{ field: userIdField, value: input[userIdField] }]
        : [];
};

/*
 * Helper function to add the default id filters identifier to the identifiers
 */
export const defaultIdFiltersIdentifier = <T extends Table>(
    defaultIdFilters:
        | {
              [K in keyof T['_']['columns']]?: T['_']['columns'][K]['_']['data'];
          }
        | undefined
) =>
    defaultIdFilters
        ? typedEntries(defaultIdFilters).map(([key, value]) => ({ field: key, value }))
        : [];
