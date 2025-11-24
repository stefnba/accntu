import { FeatureQueryBuilder } from '@/server/lib/db/query/feature-queries/core';

import { TEmptyQueries } from '@/server/lib/db/query/feature-queries/types';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';

import { TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';
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
export const createFeatureQueries = <
    TTable extends Table,
    TConfig extends TFeatureTableConfig<TTable>,
    TTableConfig extends FeatureTableConfig<TTable, TConfig> = FeatureTableConfig<TTable, TConfig>,
>(
    name: string,
    config: TTableConfig
) => {
    return new FeatureQueryBuilder<
        TEmptyQueries,
        Record<string, never>,
        TTable,
        TConfig,
        TTableConfig
    >({
        schemas: {},
        queries: {},
        config,
        name,
    });
};
