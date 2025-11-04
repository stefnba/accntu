import { TZodShape } from '@/lib/schemas/types';
import { typedEntries, typedKeys } from '@/lib/utils';
import { TStandardNewQueryConfig } from '@/server/lib/db/query/builder/feature-query/standard-new-drei/types';
import { QueryFn } from '@/server/lib/db/query/feature-queries';
import {
    defaultIdFiltersIdentifier,
    userIdIdentifier,
} from '@/server/lib/db/query/feature-queries/helpers';
import {
    GetTableColumnKeys,
    TableOperationsBuilder,
    TBooleanFilter,
} from '@/server/lib/db/query/table-operations';
import { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { Prettify } from '@/types/utils';

import { SQL, Table } from 'drizzle-orm';
import z from 'zod';

export class StandardBuilder<
    TTable extends Table,
    TBase extends TZodShape,
    TIdSchema extends TZodShape,
    TUserIdSchema extends TZodShape,
    TInsertDataSchema extends TZodShape,
    TUpdateDataSchema extends TZodShape,
    TSelectReturnSchema extends TZodShape,
    TTableConfig extends FeatureTableConfig<
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
    TQueries extends Record<string, QueryFn<any, any>> = Record<string, never>,
> {
    table: TTable;
    tableConfig: TTableConfig;
    queryConfig: TStandardNewQueryConfig<TTable>;

    tableOps: TableOperationsBuilder<TTable>;

    queries: TQueries;
    // tableConfig: Omit<TTableConfig, 'table'>;

    // constructor(tableConfig: QueryConfig<TTable, TBase, TIdSchema, TUserIdSchema, TSelectReturnSchema>) {
    constructor({
        tableConfig,
        queries,
        queryConfig,
    }: {
        tableConfig: TTableConfig;
        queries: TQueries;
        queryConfig: TStandardNewQueryConfig<TTable>;
    }) {
        // const { table, ..._config } = tableConfig;
        this.table = tableConfig.table;
        this.tableConfig = tableConfig;
        this.queries = queries;
        this.queryConfig = queryConfig;

        this.tableOps = new TableOperationsBuilder(tableConfig.table);
    }

    static create<
        TTable extends Table,
        TBase extends TZodShape,
        TIdSchema extends TZodShape,
        TUserIdSchema extends TZodShape,
        TInsertDataSchema extends TZodShape,
        TUpdateDataSchema extends TZodShape,
        TSelectReturnSchema extends TZodShape,
    >(
        tableConfig: FeatureTableConfig<
            TTable,
            TIdSchema,
            TUserIdSchema,
            TBase,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema
        >,
        queryConfig: TStandardNewQueryConfig<TTable> = {}
    ) {
        return new StandardBuilder<
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema
        >({ tableConfig, queries: {}, queryConfig });
    }

    all() {
        const b = new StandardBuilder<
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig,
            TQueries
        >({
            tableConfig: this.tableConfig,
            queries: this.queries,
            queryConfig: this.queryConfig,
        });

        return b.create().getById().getMany().updateById().removeById();
    }

    updateById() {
        const inputSchema = this.tableConfig.buildUpdateInputSchema();
        const returnColumns = this.tableConfig.getReturnColumns();
        type TInput = z.infer<typeof inputSchema>;

        const query = async (input: TInput) => {
            const parsed = inputSchema.safeParse(input);

            if (parsed.error) {
                throw new Error('Errore asjlksjdfkl');
            }
            const inputValid = parsed.data;

            let insertData = {};

            if ('data' in inputValid) {
                insertData = inputValid.data;
            } else {
                throw new Error('data must be in data');
            }

            if ('userId' in inputValid) {
                insertData = {
                    ...insertData,
                    userId: inputValid.userId,
                };
            }

            const validatedData = this.tableConfig.validateDataForTableInsert(insertData);

            const result = await this.tableOps.updateRecord({
                identifiers: this.buildIdentifiers(input),
                data: validatedData,
                returnColumns,
            });

            if (result) return result;
            return null;
        };

        const queries = {
            ...this.queries,
            updateById: query,
        };

        return new StandardBuilder<
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig,
            TQueries & { updateById: typeof query }
        >({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    getMany() {
        const returnColumns = this.tableConfig.getReturnColumns();
        const schema = this.tableConfig.userIdSchema;
        // todo
        type TInput = z.infer<typeof schema> & {
            filters?: (SQL | undefined)[];
            pagination?: {
                page?: number;
                pageSize?: number;
            };
            orderBy?: Partial<Record<GetTableColumnKeys<TTable>, 'asc' | 'desc'>>;
        };

        const query = async (input: Prettify<TInput>) => {
            const identifiers = this.buildIdentifiers(input, { ids: false, userId: true });
            const result = await this.tableOps.getManyRecords({
                columns: returnColumns,
                identifiers,
                filters: input.filters,
                pagination: input.pagination,
                orderBy: input.orderBy,
            });

            return result;
        };

        const queries = {
            ...this.queries,
            getMany: query,
        };

        return new StandardBuilder<
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig,
            TQueries & { getMany: typeof query }
        >({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    getById() {
        const returnColumns = this.tableConfig.getReturnColumns();
        const schema = this.tableConfig.buildIdentifierSChema();
        type TInput = z.infer<typeof schema>;

        const query = async (input: TInput) => {
            const identifiers = this.buildIdentifiers(input);
            const result = await this.tableOps.getFirstRecord({
                columns: returnColumns,
                identifiers,
            });

            if (result) return result;
            return null;
        };

        const queries = {
            ...this.queries,
            getById: query,
        };

        return new StandardBuilder<
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig,
            TQueries & { getById: typeof query }
        >({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    removeById() {
        const schema = this.tableConfig.buildIdentifierSChema();
        type TInput = z.infer<typeof schema>;

        const query = async (input: TInput) => {
            const identifiers = this.buildIdentifiers(input);
            await this.tableOps.removeRecord({
                identifiers,
            });
        };

        const queries = {
            ...this.queries,
            removeById: query,
        };

        return new StandardBuilder<
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig,
            TQueries & { removeById: typeof query }
        >({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    /**
     * Build identifiers array from all sources
     * @param input - Input object
     * @returns Identifiers array
     */
    private buildIdentifiers(
        input: Record<string | number, unknown>,
        selection: { ids: boolean; userId: boolean } = { ids: true, userId: true }
    ): Array<TBooleanFilter<TTable>> {
        const identifiers: Array<TBooleanFilter<TTable>> = [
            // Default filters (e.g., isActive: true)
            ...defaultIdFiltersIdentifier(this.queryConfig?.defaultFilters),
        ];

        // ID fields from input (e.g., id: '123')
        if (selection.ids) {
            if (!('ids' in input) || !input.ids || !Object.keys(input.ids).length) {
                throw new Error('Identifiers are required for getById query');
            }
            identifiers.push(
                ...typedEntries(input.ids).map(([field, value]) => ({
                    field,
                    value,
                }))
            );
        }

        // Default filters (e.g., isActive: true)
        if (selection.userId) {
            const userIdField = typedKeys(this.tableConfig.userIdSchema.shape)[0];
            if (userIdField !== undefined && !(userIdField in input)) {
                throw new Error('User ID is required when userIdColumn is configured');
            }
            identifiers.push(...userIdIdentifier(userIdField, input));
        }

        console.log(identifiers);

        return identifiers;
    }

    create() {
        const inputSchema = this.tableConfig.buildCreateInputSchema();
        const returnColumns = this.tableConfig.getReturnColumns();
        type TInput = z.infer<typeof inputSchema>;

        const query = async (input: TInput) => {
            const parsed = inputSchema.safeParse(input);

            if (parsed.error) {
                throw new Error('Errore asjlksjdfkl');
            }
            const inputValid = parsed.data;

            let insertData = {};

            if ('data' in inputValid) {
                insertData = inputValid.data;
            } else {
                throw new Error('data must be in data');
            }

            if ('userId' in inputValid) {
                insertData = {
                    ...insertData,
                    userId: inputValid.userId,
                };
            }

            const validatedData = this.tableConfig.validateDataForTableInsert(insertData);

            return this.tableOps.createRecord({
                data: validatedData,
                returnColumns,
            });
        };

        const queries = {
            ...this.queries,
            create: query,
        };

        return new StandardBuilder<
            TTable,
            TBase,
            TIdSchema,
            TUserIdSchema,
            TInsertDataSchema,
            TUpdateDataSchema,
            TSelectReturnSchema,
            TTableConfig,
            TQueries & { create: typeof query }
        >({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    done() {
        return this.queries;
    }
}
