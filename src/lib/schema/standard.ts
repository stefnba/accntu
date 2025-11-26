import type { TFeatureSchemas } from '@/lib/schema/types';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';
import { Table } from 'drizzle-orm';
import { z } from 'zod';

export class StandardSchemasBuilder<
    TTable extends Table,
    TConfig extends TFeatureTableConfig<TTable>,
    TTableConfig extends FeatureTableConfig<TTable, TConfig> = FeatureTableConfig<TTable, TConfig>,
    TSchemas extends TFeatureSchemas = Record<string, never>,
> {
    tableConfig: TTableConfig;
    schemas: TSchemas;

    constructor({ tableConfig, schemas }: { tableConfig: TTableConfig; schemas: TSchemas }) {
        this.tableConfig = tableConfig;
        this.schemas = schemas;
    }

    static create<
        TTable extends Table,
        TConfig extends TFeatureTableConfig<TTable>,
        TTableConfig extends FeatureTableConfig<TTable, TConfig> = FeatureTableConfig<
            TTable,
            TConfig
        >,
    >(tableConfig: TTableConfig) {
        return new StandardSchemasBuilder<TTable, TConfig, TTableConfig>({
            tableConfig,
            schemas: {},
        });
    }

    /**
     * Adds standard schemas for creating a single record.
     *
     * - **Service**: Requires full input (data + userId).
     * - **Endpoint (JSON)**: Requires only data (userId comes from context).
     * - **Query**: Uses the full create input schema for internal queries.
     */
    create() {
        const full = this.tableConfig.buildCreateInputSchema();

        const schema = {
            create: {
                endpoint: {
                    json: this.tableConfig.getCreateDataSchema(),
                },
                service: full,
                query: full,
            },
        };

        return new StandardSchemasBuilder<TTable, TConfig, TTableConfig, TSchemas & typeof schema>({
            tableConfig: this.tableConfig,
            schemas: {
                ...this.schemas,
                ...schema,
            },
        });
    }

    /**
     * Adds standard schemas for creating multiple records in bulk.
     *
     * - **Service**: Requires full bulk input (array of data + userId).
     * - **Endpoint (JSON)**: Requires array of data items (userId from context).
     * - **Query**: Uses array of full create inputs.
     */
    createMany() {
        const full = this.tableConfig.buildCreateManyInputSchema();

        const schema = {
            createMany: {
                service: full,
                endpoint: {
                    json: z.array(this.tableConfig.getCreateDataSchema()),
                },
                query: z.array(full),
            },
        };

        return new StandardSchemasBuilder<TTable, TConfig, TTableConfig, TSchemas & typeof schema>({
            tableConfig: this.tableConfig,
            schemas: {
                ...this.schemas,
                ...schema,
            },
        });
    }

    /**
     * Adds standard schemas for updating a record by ID.
     *
     * - **Service**: Requires full update input (data, ids, userId).
     * - **Endpoint (JSON)**: Requires partial update data.
     * - **Endpoint (Param)**: Requires ID path parameter.
     * - **Query**: Uses the full update input schema.
     */
    updateById() {
        const full = this.tableConfig.buildUpdateInputSchema();

        const schema = {
            updateById: {
                service: full,
                query: full,
                endpoint: {
                    json: this.tableConfig.getUpdateDataSchema().partial(),
                    param: this.tableConfig.getIdSchema(),
                },
            },
        };

        return new StandardSchemasBuilder<TTable, TConfig, TTableConfig, TSchemas & typeof schema>({
            tableConfig: this.tableConfig,
            schemas: {
                ...this.schemas,
                ...schema,
            },
        });
    }

    /**
     * Adds standard schemas for retrieving a single record by ID.
     *
     * - **Service**: Requires identifier input (ids + userId).
     * - **Endpoint (Param)**: Requires ID path parameter.
     * - **Query**: Uses the full identifier schema.
     */
    getById() {
        const full = this.tableConfig.buildIdentifierSchema();
        const schema = {
            getById: {
                service: full,
                query: full,
                endpoint: {
                    param: this.tableConfig.getIdSchema(),
                },
            },
        };

        return new StandardSchemasBuilder<TTable, TConfig, TTableConfig, TSchemas & typeof schema>({
            tableConfig: this.tableConfig,
            schemas: {
                ...this.schemas,
                ...schema,
            },
        });
    }

    /**
     * Adds standard schemas for removing a record by ID.
     *
     * - **Service**: Requires identifier input (ids + userId).
     * - **Endpoint (Param)**: Requires ID path parameter.
     */
    removeById() {
        const schema = {
            removeById: {
                service: this.tableConfig.buildIdentifierSchema(),
                endpoint: {
                    param: this.tableConfig.getIdSchema(),
                },
            },
        };

        return new StandardSchemasBuilder<TTable, TConfig, TTableConfig, TSchemas & typeof schema>({
            tableConfig: this.tableConfig,
            schemas: {
                ...this.schemas,
                ...schema,
            },
        });
    }

    /**
     * Adds standard schemas for retrieving multiple records (list/pagination).
     *
     * - **Service**: Requires full many input (filters, pagination, ordering, userId).
     * - **Endpoint (Query)**: Requires filters, pagination, ordering (userId excluded, from context).
     * - **Query**: Uses the full many input schema.
     */
    getMany() {
        // We need to build a query schema that excludes userId since it's handled by context/auth
        // but includes filters, pagination, and ordering
        const manyInputSchema = this.tableConfig.buildManyInputSchema();

        const pagination = this.tableConfig.getPaginationSchema();
        const filters = this.tableConfig.getFiltersSchema();

        const schema = {
            getMany: {
                service: manyInputSchema,
                endpoint: {
                    query: pagination.extend(filters.shape),
                },
                query: manyInputSchema,
            },
        };

        return new StandardSchemasBuilder<TTable, TConfig, TTableConfig, TSchemas & typeof schema>({
            tableConfig: this.tableConfig,
            schemas: {
                ...this.schemas,
                ...schema,
            },
        });
    }

    /**
     * Adds all standard operation schemas (create, createMany, updateById, getById, removeById, getMany).
     */
    all() {
        return this.create().getById().getMany().updateById().removeById().createMany();
    }

    /**
     * Finalizes the builder and returns the accumulated schemas.
     */
    done() {
        return this.schemas;
    }
}
