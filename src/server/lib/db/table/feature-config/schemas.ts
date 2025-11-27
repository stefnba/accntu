import { TZodShape } from '@/lib/validation';
import { getTableColumns, Table } from 'drizzle-orm';
import z from 'zod';

/**
 * Schema for pagination input.
 * @returns The pagination schema as an objection with a `pagination` object with `page` and `pageSize` fields.
 * @example
 * ```ts
 * const pagination = paginationSchema.parse({ pagination: { page: 1, pageSize: 10 } });
 * // { pagination: { page: 1, pageSize: 10 } }
 * ```
 */
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive(),
    pageSize: z.coerce.number().int().positive(),
});

/**
 * Zod schema for allowed ordering directions (`asc` or `desc`).
 *
 * @example
 * ```ts
 * orderByDirectionSchema.parse('asc'); // 'asc'
 * orderByDirectionSchema.parse('desc'); // 'desc'
 * ```
 */
export const orderByDirectionSchema = z.enum(['asc', 'desc']);

/**
 * Zod schema for ordering input given a Drizzle Table.
 *
 * This schema expects an optional `ordering` property
 * as an array of objects with:
 *   - `field`: one of the valid table columns
 *   - `direction`: 'asc' or 'desc'
 *
 * @param table - The Drizzle table to extract valid columns from
 * @returns A Zod schema for validating ordering input
 *
 * @example
 * ```ts
 * const schema = orderingSchema(userTable);
 * schema.parse({
 *   ordering: [
 *     { field: 'createdAt', direction: 'desc' }
 *   ]
 * });
 * // { ordering: [{ field: 'createdAt', direction: 'desc' }] }
 * ```
 */
export const orderingSchema = <TTable extends Table>(table: TTable) => {
    const columns = Object.keys(getTableColumns(table)) as Array<
        keyof TTable['_']['columns'] & string
    >;

    return z.object({
        ordering: z
            .array(
                z.object({
                    field: z.enum(columns),
                    direction: orderByDirectionSchema.default('asc'),
                })
            )
            .optional(),
    });
};

export const manyFiltersSchema = <T extends TZodShape>(schema: T) =>
    z.object({
        filters: z.object(schema).partial().optional(),
    });
