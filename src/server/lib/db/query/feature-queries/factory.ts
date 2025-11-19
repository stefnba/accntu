import { FeatureQueryBuilder } from '@/server/lib/db/query/feature-queries/core';

import { TZodShape } from '@/lib/schemas/types';
import { TEmptyQueries } from '@/server/lib/db/query/feature-queries/types';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';

import { Table } from 'drizzle-orm';
/**
 * Factory function to create a new FeatureQueryBuilder instance.
 *
 * This is the recommended way to initialize query builders. It automatically
 * derives the name from the table definition or accepts an explicit name override.
 *
 * The name is always required and used for:
 * - Debugging and logging query operations
 * - Error messages and stack traces
 * - Query identification in monitoring tools
 *
 * @template T - Drizzle table type
 *
 * @param tableOrConfig - Either:
 *   - A Drizzle table directly (name derived from table._.name)
 *   - An object with { table, name } for explicit naming
 *
 * @returns New FeatureQueryBuilder instance ready for query registration
 *
 * @example
 * ```typescript
 * // Simple usage - name derived from table definition
 * const queries = createFeatureQueries(userTable)
 *
 * // With explicit name override (useful for debugging)
 * const queries = createFeatureQueries({ table: userTable, name: 'user-auth' })
 *
 * // Full example with query registration
 * const queries = createFeatureQueries(userTable)
 *   .registerSchema(userSchemas)
 *   .standardQueries({ idColumns: ['id'], userIdColumn: 'userId' })
 *     .create({ allowedColumns: ['name', 'email'], returnColumns: ['id'] })
 *     .done()
 * ```
 */
// export const createFeatureQueriesOld = <T extends Table>(
//     tableOrConfig: T | { table: T; name?: string }
// ) => {
//     // Extract table from config or use directly
//     const table =
//         typeof tableOrConfig === 'object' && 'table' in tableOrConfig
//             ? tableOrConfig.table
//             : tableOrConfig;

//     // Derive name: explicit > table name > fallback
//     const name =
//         typeof tableOrConfig === 'object' && 'name' in tableOrConfig
//             ? (tableOrConfig.name ?? table?._?.name ?? 'unknown')
//             : (table?._?.name ?? 'unknown');

//     return new FeatureQueryBuilder({
//         schemas: {},
//         queries: {},
//         table,
//         name,
//     });
// };

export const createFeatureQueries = <
    TTable extends Table,
    TBase extends TZodShape,
    TIdSchema extends TZodShape,
    TUserIdSchema extends TZodShape,
    TInsertDataSchema extends TZodShape,
    TUpdateDataSchema extends TZodShape,
    TSelectReturnSchema extends TZodShape,
>(
    name: string,
    config: FeatureTableConfig<
        TTable,
        TIdSchema,
        TUserIdSchema,
        TBase,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema
    >
) => {
    return new FeatureQueryBuilder<
        TEmptyQueries,
        Record<string, never>,
        TTable,
        TBase,
        TIdSchema,
        TUserIdSchema,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema,
        FeatureTableConfig<
            TTable,
            TIdSchema,
            TUserIdSchema,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema
        >
    >({
        schemas: {},
        queries: {},
        config,
        name,
    });
};
