import { TZodShape } from '@/lib/schemas/types';
import { typedEntries, typedKeys } from '@/lib/utils';
import { TStandardNewQueryConfig } from '@/server/lib/db/query/builder/feature-query/standard-new-drei/types';
import {
    defaultIdFiltersIdentifier,
    userIdIdentifier,
} from '@/server/lib/db/query/feature-queries/helpers';
import { QueryFn } from '@/server/lib/db/query/feature-queries/types';
import {
    GetTableColumnKeys,
    InferTableColumnTypes,
    TBooleanFilter,
} from '@/server/lib/db/query/table-operations';
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations/core';
import type { FeatureTableConfig } from '@/server/lib/db/table/feature-config';
import {
    InferCreateInput,
    InferIdsInput,
    InferReturnColums,
    InferTableFromConfig,
    InferUserIdInput,
} from '@/server/lib/db/table/feature-config/types';
import { Prettify } from '@/types/utils';
import { InferInsertModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export class StandardQueryBuilder<
    TConfig extends FeatureTableConfig<any, any, any, any, any, any, any>,
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

    private selectReturnSchema: z.ZodObject<TConfig['selectReturnSchema']['shape']>;
    // private userIdField: InferOptionalSchema<TConfig['userIdSchema']> extends undefined ? undefined : keyof InferOptionalSchema<TConfig['userIdSchema']>;
    private userIdSchema: z.ZodObject<TConfig['userIdSchema']['shape']>;

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
        this.selectReturnSchema = config.selectReturnSchema;
        this.userIdSchema = config.userIdSchema;
    }

    validateInputForInsertDefinedSchema = (
        input: unknown
    ): z.infer<typeof this.config.insertDataSchema> => {
        const result = this.config.insertDataSchema.safeParse(input);

        if (!result.success) {
            throw new Error(`Invalid input data: ${result.error.message}`);
        }

        // Now result.data is properly typed!
        return result.data;
    };

    getUserIdFieldName(): keyof TConfig['userIdSchema']['shape'] {
        return typedKeys(this.userIdSchema.shape)[0];
    }

    create(options: { dataColumnSchema?: z.ZodObject<TZodShape> }) {
        const { dataColumnSchema = z.object({}) } = options ?? {};

        const returnColumns = this.config.getReturnColumns();
        console.log('returnColumns', returnColumns);

        const buildCreateInput = (
            input: InferCreateInput<TConfig>
        ): InferInsertModel<InferTableFromConfig<TConfig>> => {
            const userIdField = this.getUserIdFieldName();

            // insertDataSchema for drizzle table

            // insertDataSchema for our defined insert schema
            const insertDataSchema = this.config.insertDataSchema;

            console.log('input', input);
            console.log('userIdField', userIdField);

            const validateInputForInsertTableSchema = (
                input: unknown
            ): asserts input is InferInsertModel<InferTableFromConfig<TConfig>> => {
                const insertTableSchema = createInsertSchema(this.table);
                const result = insertTableSchema.safeParse(input);

                if (!result.success) {
                    throw new Error(`Invalid input data: ${result.error.message}`);
                }
            };

            const validateInputForInsert = (
                input: unknown
            ): InferInsertModel<InferTableFromConfig<TConfig>> => {
                const insertTableSchema = createInsertSchema(this.table);
                const result = insertTableSchema.safeParse(input);

                console.log('result for insertTableSchema', result);

                if (!result.success) {
                    console.log('result', result.error);
                    throw new Error('Invalid input data for insert schema');
                }

                return result.data;
            };

            // const validateInput = (
            //     input: object
            // ): input is InferInsertModel<InferTableFromConfig<TConfig>> => {
            //     const result = insertTableSchema.safeParse(input);

            //     if (!result.success) {
            //         console.log('result', result.error);
            //         return false;
            //     }

            //     return true;
            // };

            // validate input
            if (!input || !input.data) {
                throw new Error('Invalid input data');
            }

            // validate userId field if userIdSchema is configured
            if (userIdField) {
                if (userIdField in input && userIdField && typeof userIdField === 'string') {
                    const userId = Reflect.get(input, userIdField); // get userId field value from input
                    const inputData = {
                        ...input.data,
                        [userIdField]: userId,
                    };

                    // validate input data based on insert schema
                    const validatedInput = validateInputForInsertTableSchema(inputData);

                    return validatedInput;
                } else {
                    throw new Error(
                        `UserId field name '${String(userIdField)}' is required in input when userIdSchema is configured`
                    );
                }
            }

            const validatedInput = validateInputForInsert(input.data);
            console.log('validatedInput', validatedInput);

            return validatedInput;
        };

        // type TReturn = Prettify<
        //     Pick<
        //         InferTableColumnTypes<InferTableFromConfig<TConfig>>,
        //         InferReturnColums<TConfig> &
        //             keyof InferTableColumnTypes<InferTableFromConfig<TConfig>>
        //     >
        // >;

        const createQuery = async (input: InferCreateInput<TConfig>) => {
            // Get userIdColumn if configured
            // const userIdField = this.getUserIdFieldName();

            // console.log('input', input);

            // 1. validate input based on our defined insert schema
            // const insertDataSchema = this.config.insertDataSchema;

            // const validatedInput = insertDataSchema.safeParse(input.data);
            // if (!validatedInput.success) {
            //     console.log('validatedInput', validatedInput.error);
            //     throw new Error('Invalid input data');
            // }

            const data = buildCreateInput(input);
            console.log('data after buildCreateInput', data);

            const result = await this.tableOps.createRecord<
                Array<GetTableColumnKeys<InferTableFromConfig<TConfig>>>
            >({
                data,
                returnColumns,
                // onConflict: this.config.defaults.onConflict,
            });

            return result;
        };

        const newStandardQueries = {
            ...this.standardQueries,
            create: createQuery,
        };

        return new StandardQueryBuilder<TConfig, TStandardQueries & { create: typeof createQuery }>(
            {
                config: this.config,
                standardQueries: newStandardQueries,
                standardQueryConfig: this.standardQueryConfig,
            }
        );
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

    // updateById() {
    //     // type TInput = Prettify<InferIdsInput<TConfig> & Prettify<InferUserIdInput<TConfig>>>;
    //     type TInput = Prettify<InferUpdateInput<TConfig>>;
    //     type TReturn = Prettify<
    //         Pick<
    //             InferTableColumnTypes<InferTableFromConfig<TConfig>>,
    //             InferReturnColums<TConfig> &
    //                 keyof InferTableColumnTypes<InferTableFromConfig<TConfig>>
    //         >
    //     >;

    //     const updateByIdQuery: QueryFn<TInput, TReturn | null> = async (input: TInput) => {
    //         const identifiers = this.buildIdentifiers(input);

    //         const data = input.data;

    //         return this.tableOps.updateRecord({
    //             identifiers,
    //             data,
    //             returnColumns: this.config.getReturnColumns(),
    //         });
    //     };

    //     const newStandardQueries = {
    //         ...this.standardQueries,
    //         updateById: updateByIdQuery,
    //     };

    //     return new StandardQueryBuilder<
    //         TConfig,
    //         TStandardQueries & { updateById: QueryFn<TInput, TReturn | null> }
    //     >({
    //         config: this.config,
    //         standardQueries: newStandardQueries,
    //         standardQueryConfig: this.standardQueryConfig,
    //     });
    // }

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
