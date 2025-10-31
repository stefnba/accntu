import { TZodShape } from '@/lib/schemas/types';
import { typedEntries, typedKeys } from '@/lib/utils';
import { TStandardNewQueryConfig } from '@/server/lib/db/query/builder/feature-query/standard-new/types';
import {
    defaultIdFiltersIdentifier,
    userIdIdentifier,
} from '@/server/lib/db/query/feature-queries/helpers';
import { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import { InferTableColumnTypes, TBooleanFilter } from '@/server/lib/db/query/table-operations';
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations/core';
import type { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import {
    InferCreateInput,
    InferIdsInput,
    InferReturnColums,
    InferTableFromConfig,
    InferUpdateInput,
    InferUserIdInput,
} from '@/server/lib/db/table/feature-config/types';
import { Prettify } from '@/types/utils';
import { Table } from 'drizzle-orm';
import z from 'zod';

export class StandardQueryBuilder<
    TConfig extends FeatureTableConfig<
        Table,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape,
        TZodShape
    >,
    TStandardQueries extends Record<string, QueryFn<any, any>> = Record<string, never>,
    TStandardQueryConfig extends TStandardNewQueryConfig<
        InferTableFromConfig<TConfig>
    > = TStandardNewQueryConfig<InferTableFromConfig<TConfig>>,
> {
    private config: TConfig;
    private table: InferTableFromConfig<TConfig>;
    private standardQueries: TStandardQueries;
    private standardQueryConfig: TStandardQueryConfig;

    /** Shared table operations builder (reused from parent FeatureQueryBuilder) */
    private tableOps: TableOperationsBuilder<InferTableFromConfig<TConfig>>;

    constructor({
        config,
        standardQueries,
        standardQueryConfig,
    }: {
        config: TConfig;
        standardQueries: TStandardQueries;
        standardQueryConfig: TStandardQueryConfig;
    }) {
        this.table = config.getTable();
        this.config = config;
        this.standardQueries = standardQueries;
        this.tableOps = new TableOperationsBuilder(this.table);
        this.standardQueryConfig = standardQueryConfig;
    }

    create(options: { dataColumnSchema: z.ZodObject<TZodShape> }) {
        const { dataColumnSchema } = options ?? {};

        type TInput = InferCreateInput<TConfig>;
        type TReturn = Prettify<
            Pick<
                InferTableColumnTypes<InferTableFromConfig<TConfig>>,
                InferReturnColums<TConfig> &
                    keyof InferTableColumnTypes<InferTableFromConfig<TConfig>>
            >
        >;

        const createQuery: QueryFn<TInput, TReturn | null> = async (input: TInput) => {
            return this.tableOps.createRecord({
                data: input.data,
                returnColumns: this.config.getReturnColumns(),
                // onConflict: this.config.defaults.onConflict,
            });
        };

        const newStandardQueries = {
            ...this.standardQueries,
            create: createQuery,
        };

        return new StandardQueryBuilder<
            TConfig,
            TStandardQueries & { create: QueryFn<TInput, TReturn | null> }
        >({
            config: this.config,
            standardQueries: newStandardQueries,
            standardQueryConfig: this.standardQueryConfig,
        });
    }

    getById() {
        type TInput = Prettify<InferIdsInput<TConfig> & Prettify<InferUserIdInput<TConfig>>>;
        type TReturn = Prettify<
            Pick<
                InferTableColumnTypes<InferTableFromConfig<TConfig>>,
                InferReturnColums<TConfig> &
                    keyof InferTableColumnTypes<InferTableFromConfig<TConfig>>
            >
        >;

        const getByIdQuery: QueryFn<TInput, TReturn | null> = async (input: TInput) => {
            const identifiers = this.buildIdentifiers(input);

            return this.tableOps.getFirstRecord({
                identifiers,
                columns: this.config.getReturnColumns(),
                // onConflict: this.config.defaults.onConflict,
            });
        };

        const newStandardQueries = {
            ...this.standardQueries,
            getById: getByIdQuery,
        };

        return new StandardQueryBuilder<
            TConfig,
            TStandardQueries & { getById: QueryFn<TInput, TReturn | null> }
        >({
            config: this.config,
            standardQueries: newStandardQueries,
            standardQueryConfig: this.standardQueryConfig,
        });
    }

    updateById() {
        // type TInput = Prettify<InferIdsInput<TConfig> & Prettify<InferUserIdInput<TConfig>>>;
        type TInput = Prettify<InferUpdateInput<TConfig>>;
        type TReturn = Prettify<
            Pick<
                InferTableColumnTypes<InferTableFromConfig<TConfig>>,
                InferReturnColums<TConfig> &
                    keyof InferTableColumnTypes<InferTableFromConfig<TConfig>>
            >
        >;

        const updateByIdQuery: QueryFn<TInput, TReturn | null> = async (input: TInput) => {
            const identifiers = this.buildIdentifiers(input);

            const data = input.data;

            return this.tableOps.updateRecord({
                identifiers,
                data,
                returnColumns: this.config.getReturnColumns(),
            });
        };

        const newStandardQueries = {
            ...this.standardQueries,
            updateById: updateByIdQuery,
        };

        return new StandardQueryBuilder<
            TConfig,
            TStandardQueries & { updateById: QueryFn<TInput, TReturn | null> }
        >({
            config: this.config,
            standardQueries: newStandardQueries,
            standardQueryConfig: this.standardQueryConfig,
        });
    }

    // removeById() {
    //     type TInput = Prettify<InferIdsInput<TConfig> & Prettify<InferUserIdInput<TConfig>>>;
    //     type TReturn = Prettify<
    //         Pick<
    //             InferTableColumnTypes<InferTableFromConfig<TConfig>>,
    //             InferReturnColums<TConfig> &
    //                 keyof InferTableColumnTypes<InferTableFromConfig<TConfig>>
    //         >
    //     >;
    //     const removeByIdQuery: QueryFn<TInput, void> = async (input: TInput) => {
    //         const identifiers = this.buildIdentifiers(input);

    //         return this.tableOps.removeRecord({
    //             identifiers,
    //             returnColumns: this.config.getReturnColumns(),
    //         });
    //     };

    //     const newStandardQueries = {
    //         ...this.standardQueries,
    //         removeById: removeByIdQuery,
    //     };

    //     return new StandardQueryBuilder<
    //         TConfig,
    //         TStandardQueries & { removeById: QueryFn<TInput, TReturn | null> }
    //     >({
    //         config: this.config,
    //         standardQueries: newStandardQueries,
    //         standardQueryConfig: this.standardQueryConfig,
    //     });
    // }

    done() {
        return this.standardQueries;
    }

    /**
     * Build identifiers array from all sources
     * @param input - Input object
     * @returns Identifiers array
     */
    private buildIdentifiers(input: object): Array<TBooleanFilter<InferTableFromConfig<TConfig>>> {
        if (!('ids' in input) || !input.ids || !Object.keys(input.ids).length) {
            throw new Error('Identifiers are required for getById query');
        }

        const userIdField = typedKeys(this.config.userIdSchema.shape)[0];

        if (userIdField !== undefined && !('userId' in input)) {
            throw new Error('User ID is required when userIdColumn is configured');
        }

        // Build identifiers array from all sources
        const identifiers: Array<TBooleanFilter<InferTableFromConfig<TConfig>>> = [
            // 1. userId identifier (if configured)
            ...userIdIdentifier(userIdField, input),
            // 2. Default filters (e.g., isActive: true)
            ...defaultIdFiltersIdentifier(this.standardQueryConfig?.defaultFilters),
            // 3. ID fields from input (e.g., id: '123')
            ...typedEntries(input.ids).map(([field, value]) => ({
                field,
                value,
            })),
        ];

        console.log(identifiers);

        return identifiers;
    }
}
