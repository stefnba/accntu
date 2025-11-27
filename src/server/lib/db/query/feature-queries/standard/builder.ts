import { typedEntries, typedKeys } from '@/lib/utils';
import type { QueryFn, TEmptyQueries } from '@/server/lib/db/query/feature-queries/types';
import {
    defaultIdFiltersIdentifier,
    userIdIdentifier,
} from '@/server/lib/db/query/feature-queries/utils';
import { withTableFilters } from '@/server/lib/db/query/filters';
import {
    TableOperationsBuilder,
    TBooleanFilter,
    TPagination,
} from '@/server/lib/db/query/table-operations';
import {
    FeatureConfigValidationError,
    FeatureTableConfig,
} from '@/server/lib/db/table/feature-config';
import { TFeatureTableConfig } from '@/server/lib/db/table/feature-config/types';
import { AppErrors } from '@/server/lib/error';
import { Table } from 'drizzle-orm';
import z from 'zod';
import { TStandardNewQueryConfig } from './types';

export class StandardQueryBuilder<
    TTable extends Table,
    TConfig extends TFeatureTableConfig<TTable>,
    TQueries extends Record<string, QueryFn<unknown, unknown>> = TEmptyQueries,
> {
    table: TTable;
    tableConfig: FeatureTableConfig<TTable, TConfig>;
    queryConfig: TStandardNewQueryConfig<TTable, TConfig>;

    tableOps: TableOperationsBuilder<TTable>;

    queries: TQueries;

    constructor({
        tableConfig,
        queries,
        queryConfig,
    }: {
        tableConfig: FeatureTableConfig<TTable, TConfig>;
        queries: TQueries;
        queryConfig: TStandardNewQueryConfig<TTable, TConfig>;
    }) {
        const table = tableConfig.getTable();
        this.table = table;
        this.tableConfig = tableConfig;
        this.queries = queries;
        this.queryConfig = queryConfig;

        this.tableOps = new TableOperationsBuilder(table);
    }

    static create<TTable extends Table, TConfig extends TFeatureTableConfig<TTable>>(
        tableConfig: FeatureTableConfig<TTable, TConfig>,
        queryConfig: TStandardNewQueryConfig<TTable, TConfig> = {}
    ) {
        return new StandardQueryBuilder<TTable, TConfig>({ tableConfig, queries: {}, queryConfig });
    }

    /**
     * Adds all standard operations (create, getById, getMany, updateById, removeById, createMany).
     */
    all() {
        const b = new StandardQueryBuilder<TTable, TConfig, TQueries>({
            tableConfig: this.tableConfig,
            queries: this.queries,
            queryConfig: this.queryConfig,
        });

        return b.create().getById().getMany().updateById().removeById().createMany();
    }

    /**
     * Helper to execute a validation function and translate FeatureConfigValidationError to AppErrors.
     *
     * @param fn - The validation function to execute
     * @returns The result of the validation function
     * @throws AppErrors.validation if FeatureConfigValidationError occurs
     */
    private validate<T>(fn: () => T): T {
        try {
            return fn();
        } catch (error) {
            if (error instanceof FeatureConfigValidationError) {
                throw AppErrors.validation('INVALID_INPUT', {
                    message: error.message,
                    details: error.details,
                });
            }
            throw error;
        }
    }

    /**
     * Adds the `updateById` operation.
     */
    updateById() {
        type TInput = z.infer<ReturnType<typeof this.tableConfig.buildUpdateInputSchema>>;

        const returnColumns = this.tableConfig.getReturnColumns();

        const query = async (input: TInput) => {
            // Validate the full input and extract/validate the data portion
            const validatedData = this.validate(() =>
                this.tableConfig.validateUpdateDataForTableUpdate(input)
            );

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

        return new StandardQueryBuilder<TTable, TConfig, TQueries & { updateById: typeof query }>({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    /**
     * Helper to build filters from input.
     */
    private buildFilters(input: unknown) {
        const filtersInput = this.tableConfig.validateFiltersInput(input);

        if (!filtersInput) return undefined;

        return this.queryConfig.getMany?.filters?.(filtersInput, withTableFilters(this.table));
    }

    /**
     * Helper to build pagination from input.
     */
    private buildPagination(input: unknown): TPagination {
        const paginationInput = this.tableConfig.validatePaginationInput(input);

        const defaultPageSize = this.queryConfig.getMany?.defaultPagination?.pageSize ?? 25;

        if (!paginationInput) return { page: 1, pageSize: defaultPageSize };

        return {
            page:
                'page' in paginationInput && typeof paginationInput.page === 'number'
                    ? paginationInput.page
                    : 1,
            pageSize:
                'pageSize' in paginationInput && typeof paginationInput.pageSize === 'number'
                    ? paginationInput.pageSize
                    : defaultPageSize,
        };
    }

    /**
     * Adds the `getMany` operation.
     */
    getMany() {
        const returnColumns = this.tableConfig.getReturnColumns();
        type TInput = z.infer<
            ReturnType<FeatureTableConfig<TTable, TConfig>['buildManyInputSchema']>
        >;

        const query = async (input: TInput) => {
            // identifiers, only userId
            const identifiers = this.buildIdentifiers(input, { ids: false, userId: true });

            // filters
            const filters = this.buildFilters(input);

            // ordering
            const orderBy =
                this.tableConfig.validateOrderingInput(input) ??
                this.queryConfig.getMany?.defaultOrdering;

            // pagination
            const pagination = this.buildPagination(input);

            // query
            const result = await this.tableOps.getManyRecords({
                columns: returnColumns,
                identifiers,
                filters,
                pagination,
                orderBy,
            });

            return result;
        };

        const queries = {
            ...this.queries,
            getMany: query,
        };

        return new StandardQueryBuilder<TTable, TConfig, TQueries & { getMany: typeof query }>({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    /**
     * Adds the `getById` operation.
     */
    getById() {
        const returnColumns = this.tableConfig.getReturnColumns();
        type TInput = z.infer<ReturnType<typeof this.tableConfig.buildIdentifierSchema>>;

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

        return new StandardQueryBuilder<TTable, TConfig, TQueries & { getById: typeof query }>({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    /**
     * Adds the `removeById` operation.
     */
    removeById() {
        type TInput = z.infer<ReturnType<typeof this.tableConfig.buildIdentifierSchema>>;

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

        return new StandardQueryBuilder<TTable, TConfig, TQueries & { removeById: typeof query }>({
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
            if (!('ids' in input) || !input.ids || !Object.keys(input.ids as object).length) {
                throw new Error('Identifiers are required for getById query');
            }
            identifiers.push(
                ...typedEntries(input.ids as object).map(([field, value]) => ({
                    field,
                    value,
                }))
            );
        }

        // Default filters (e.g., isActive: true)
        if (selection.userId) {
            const userIdField = typedKeys(this.tableConfig.getUserIdSchema().shape)[0];
            if (userIdField !== undefined && !(userIdField in input)) {
                throw new Error('User ID is required when userIdColumn is configured');
            }
            identifiers.push(...userIdIdentifier(userIdField, input));
        }

        return identifiers;
    }

    /**
     * Adds the `create` operation.
     */
    create() {
        const returnColumns = this.tableConfig.getReturnColumns();
        type TInput = z.infer<ReturnType<typeof this.tableConfig.buildCreateInputSchema>>;

        const query = async (input: TInput) => {
            // Validate the full input (with data wrapper)
            const validatedData = this.validate(() =>
                this.tableConfig.validateDataForTableInsert(input)
            );

            return this.tableOps.createRecord({
                data: validatedData,
                returnColumns,
            });
        };

        const queries = {
            ...this.queries,
            create: query,
        };

        return new StandardQueryBuilder<TTable, TConfig, TQueries & { create: typeof query }>({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    /**
     * Adds the `createMany` operation.
     */
    createMany() {
        const returnColumns = this.tableConfig.getReturnColumns();
        type TInput = z.infer<ReturnType<typeof this.tableConfig.buildCreateManyInputSchema>>;

        const query = async (input: TInput) => {
            // Validate the full input and extract/merge/validate all records
            const validatedData = this.validate(() =>
                this.tableConfig.validateDataForTableInsertMany(input)
            );

            return this.tableOps.createManyRecords({
                data: validatedData,
                returnColumns,
            });
        };

        const queries = {
            ...this.queries,
            createMany: query,
        };

        return new StandardQueryBuilder<TTable, TConfig, TQueries & { createMany: typeof query }>({
            tableConfig: this.tableConfig,
            queries,
            queryConfig: this.queryConfig,
        });
    }

    /**
     * Returns the accumulated queries.
     */
    done() {
        return this.queries;
    }
}
