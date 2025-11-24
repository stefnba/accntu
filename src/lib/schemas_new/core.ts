import type { TFeatureSchemaObject, TFeatureSchemas } from '@/lib/schemas_new/types';
import { Table } from 'drizzle-orm';
import { z } from 'zod';

import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { paginationSchema } from '@/server/lib/db/table/feature-config/schemas';
import { InferTableSchema, TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export class FeatureSchemasBuilder<
    const TSchemas extends Record<string, TFeatureSchemas>,
    const TTable extends Table,
    const TConfig extends TFeatureTableConfig<TTable>,
    const TTableConfig extends FeatureTableConfig<TTable, TConfig> = FeatureTableConfig<
        TTable,
        TConfig
    >,
> {
    /** The builder schemas */
    schemas: TSchemas;

    /** Table configuration */
    tableConfig: TTableConfig;

    /** Drizzle table definition */
    table: TTable;

    constructor({ schemas, config }: { schemas: TSchemas; config: TTableConfig }) {
        this.schemas = schemas;
        this.tableConfig = config;
        this.table = config.getTable();
    }

    // The addSchema method should accept a key and a config function, returning a shape (e.g., TZodShape).
    // The config function receives schema objects (for insert, select, update).
    addSchema<const K extends string, const O extends TFeatureSchemaObject>(
        key: K,
        config: (args: {
            schemas: {
                /** The raw table schemas */
                table: {
                    /** The insert schema */
                    insert: InferTableSchema<TTable, 'insert'>;
                    /** The select schema */
                    select: InferTableSchema<TTable, 'select'>;
                    /** The update schema */
                    update: InferTableSchema<TTable, 'update'>;
                };
                /** The input schemas */
                input: {
                    /** The update input schema */
                    update: ReturnType<
                        FeatureTableConfig<TTable, TConfig>['buildUpdateInputSchema']
                    >;
                    /** The create input schema */
                    create: ReturnType<
                        FeatureTableConfig<TTable, TConfig>['buildCreateInputSchema']
                    >;
                };
                /** The input data schema */
                inputData: {
                    /** The update input data schema */
                    update: z.ZodObject<TConfig['updateData']>;
                    /** The insert input data schema */
                    insert: z.ZodObject<TConfig['createData']>;
                };
                /** The return schema */
                return: z.ZodObject<TConfig['returnCols']>;
                /** The base schema */
                base: z.ZodObject<TConfig['base']>;
                /** The id schema */
                id: z.ZodObject<TConfig['id']>;
                /** The user id schema */
                userId: z.ZodObject<TConfig['userId']>;
            };
            helpers: {
                /** The identifier schema */
                buildIdentifierSchema: () => ReturnType<
                    FeatureTableConfig<TTable, TConfig>['buildIdentifierSchema']
                >;
                /** The pagination schema */
                buildPaginationSchema: () => typeof paginationSchema;
            };
        }) => O
    ) {
        const schema = config({
            helpers: {
                buildIdentifierSchema: () => this.tableConfig.buildIdentifierSchema(),
                buildPaginationSchema: () => paginationSchema,
            },
            schemas: {
                table: {
                    insert: createInsertSchema(this.table),
                    select: createSelectSchema(this.table),
                    update: createUpdateSchema(this.table),
                },
                input: {
                    update: this.tableConfig.buildUpdateInputSchema(),
                    create: this.tableConfig.buildCreateInputSchema(),
                },
                inputData: {
                    update: this.tableConfig.getUpdateDataSchema(),
                    insert: this.tableConfig.getCreateDataSchema(),
                },
                return: this.tableConfig.getReturnColumnsSchema(),
                base: this.tableConfig.getBaseSchema(),
                id: this.tableConfig.getIdSchema(),
                userId: this.tableConfig.getUserIdSchema(),
            },
        });

        return new FeatureSchemasBuilder<TSchemas & Record<K, O>, TTable, TConfig, TTableConfig>({
            schemas: { ...this.schemas, [key]: schema },
            config: this.tableConfig,
        });
    }

    build(): TSchemas {
        return this.schemas;
    }
}
