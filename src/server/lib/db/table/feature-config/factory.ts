import { FeatureTableConfigBuilder } from '@/server/lib/db/table/feature-config/core';
import { Table } from 'drizzle-orm';

/**
 * Factory function to create a feature table configuration builder.
 *
 * This is the recommended entry point for creating table configurations.
 * Returns a builder with a fluent API to configure ID fields, schemas,
 * and column restrictions.
 *
 * @param table - Drizzle table definition
 * @returns Builder instance for configuring the table
 *
 * @example
 * ```ts
 * import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
 * import { myTable } from '@/server/db/tables';
 *
 * const config = createFeatureTableConfig(myTable)
 *   .setIds(['id'])                    // Define primary key
 *   .setUserId('userId')               // Define user ID for RLS
 *   .restrictUpsertFields(['name', 'description']) // Limit writable fields
 *   .restrictReturnColumns(['id', 'name'])         // Limit returned columns
 *   .build();                          // Build immutable config
 * ```
 */
export const createFeatureTableConfig = <TTable extends Table>(table: TTable) => {
    return FeatureTableConfigBuilder.create<TTable>(table);
};
