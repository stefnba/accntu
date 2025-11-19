import type { TFeatureSchemaObject, TFeatureSchemas, TZodShape } from '@/lib/schemas_new/types';
import { Table } from 'drizzle-orm';
import { z } from 'zod';

import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { InferTableSchema } from '@/server/lib/db/table/feature-config/types';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

const paginationSchema = z
    .object({
        page: z.coerce.number().int().min(1).optional(),
        pageSize: z.coerce.number().int().min(1).max(100).optional(),
    })
    .partial()
    .optional()
    .default({
        page: 1,
        pageSize: 10,
    });

export class FeatureSchemasBuilder<
    const S extends Record<string, TFeatureSchemas>,
    const TTable extends Table,
    const TBase extends TZodShape,
    const TIdSchema extends TZodShape,
    const TUserIdSchema extends TZodShape,
    const TInsertDataSchema extends TZodShape,
    const TUpdateDataSchema extends TZodShape,
    const TSelectReturnSchema extends TZodShape,
    const TTableConfig extends FeatureTableConfig<
        TTable,
        TIdSchema,
        TUserIdSchema,
        TBase,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema
    > = FeatureTableConfig<
        TTable,
        TIdSchema,
        TUserIdSchema,
        TBase,
        TInsertDataSchema,
        TUpdateDataSchema,
        TSelectReturnSchema
    >,
> {
    /** The builder schemas */
    schemas: S;

    /** Table configuration */
    tableConfig: TTableConfig;

    /** Drizzle table definition */
    table: TTable;

    constructor({ schemas, config }: { schemas: S; config: TTableConfig }) {
        this.schemas = schemas;
        this.tableConfig = config;
        this.table = config.table;
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
                    update: z.ZodObject<
                        {
                            data: TTableConfig['updateDataSchema'];
                            ids: TTableConfig['idSchema'];
                        } & TUserIdSchema
                    >;
                    /** The create input schema */
                    create: z.ZodObject<
                        {
                            data: TTableConfig['insertDataSchema'];
                        } & TUserIdSchema
                    >;
                };
                /** The input data schema */
                inputData: {
                    /** The update input data schema */
                    update: TTableConfig['updateDataSchema'];
                    /** The insert input data schema */
                    insert: TTableConfig['insertDataSchema'];
                };
                /** The return schema */
                return: TTableConfig['selectReturnSchema'];
                /** The base schema */
                base: TTableConfig['baseSchema'];
                /** The id schema */
                id: TTableConfig['idSchema'];
                /** The user id schema */
                userId: TTableConfig['userIdSchema'];
            };
            helpers: {
                /** The identifier schema */
                buildIdentifierSchema: TTableConfig['buildIdentifierSchema'];
                /** The pagination schema */
                buildPaginationSchema: () => typeof paginationSchema;
            };
        }) => O
    ) {
        const schema = config({
            helpers: {
                buildIdentifierSchema: this.tableConfig.buildIdentifierSchema,
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
                    update: this.tableConfig.updateDataSchema,
                    insert: this.tableConfig.insertDataSchema,
                },
                return: this.tableConfig.selectReturnSchema,
                base: this.tableConfig.baseSchema,
                id: this.tableConfig.idSchema,
                userId: this.tableConfig.userIdSchema,
            },
        });

        return new FeatureSchemasBuilder<
            S & Record<K, O>,
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig
        >({
            schemas: { ...this.schemas, [key]: schema },
            config: this.tableConfig,
        });
    }

    build(): S {
        return this.schemas;
    }
}
