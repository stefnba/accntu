import { tag, tagToTransaction } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import {
    InferCreateInput,
    InferIdsInput,
    InferManyFiltersInput,
    InferOptionalSchema,
    InferReturnColums,
    InferTableFromConfig,
    InferUpdateInput,
    IsEmptySchema,
} from '@/server/lib/db/table/feature-config/types';
import z from 'zod';

// ================================================================
// Tag Table Config Example
// ================================================================

//
const tagTableConfig = createFeatureTableConfig(tag)
    .omitBaseSchema(['transactionCount'])
    // .removeIds()
    // .removeUserId()
    .restrictReturnColumns(['name', 'color', 'userId', 'id'])
    .restrictUpsertFields(['name', 'description', 'color'])
    .enableManyFiltering({
        createdAt: z.date(),
        name: z.string(),
        startDate: z.date(),
    })
    .enablePagination()
    .enableOrdering(['createdAt'])
    .build();

export const tagTableConfigReturn = {
    returnColums: tagTableConfig.getReturnColumns(),
    userIdFieldName: tagTableConfig.getUserIdFieldName(),
    idsFieldNames: tagTableConfig.getIdsFieldNames(),
    // schemas
    baseSchema: tagTableConfig.baseSchema,
    idSchema: tagTableConfig.idSchema,
    userIdSchema: tagTableConfig.userIdSchema,
    insertDataSchema: tagTableConfig.insertDataSchema,
    updateDataSchema: tagTableConfig.updateDataSchema,
    selectReturnSchema: tagTableConfig.selectReturnSchema,
    manyFiltersSchema: tagTableConfig.manyFiltersSchema,
    paginationSchema: tagTableConfig.paginationSchema,
    orderingSchema: tagTableConfig.orderingSchema,
    // input schemas
    createSchema: tagTableConfig.buildCreateInputSchema(),
    updateSchema: tagTableConfig.buildUpdateInputSchema(),
    manyInputSchema: tagTableConfig.buildManyInputSchema(),
} as const;

export type TTagTableConfigReturn = {
    // z.infer
    ZodCreateSchema: z.infer<typeof tagTableConfigReturn.createSchema>;
    ZodUpdateSchema: z.infer<typeof tagTableConfigReturn.updateSchema>;
    ZodReturnSchema: z.infer<typeof tagTableConfigReturn.selectReturnSchema>;
    ZodManyFiltersSchema: z.infer<typeof tagTableConfigReturn.manyFiltersSchema>;
    ZodPaginationSchema: z.infer<typeof tagTableConfigReturn.paginationSchema>;
    ZodOrderingSchema: z.infer<typeof tagTableConfigReturn.orderingSchema>;
    ZodManyInputSchema: z.infer<typeof tagTableConfigReturn.manyInputSchema>;

    // our schema infer
    CreateInput: InferCreateInput<typeof tagTableConfig>;
    UpdateInput: InferUpdateInput<typeof tagTableConfig>;
    IdsInput: InferIdsInput<typeof tagTableConfig>;
    TTable: InferTableFromConfig<typeof tagTableConfig>;
    ReturnColumns: InferReturnColums<typeof tagTableConfig>;
    TIdsInput: InferIdsInput<typeof tagTableConfig>;
    TManyFiltersInput: InferManyFiltersInput<typeof tagTableConfig>;

    // optional schema
    IdSchema: InferOptionalSchema<typeof tagTableConfigReturn.idSchema>;
    userIdSchema: InferOptionalSchema<typeof tagTableConfigReturn.userIdSchema>;
};

export type IdSchemaIsEmpty = IsEmptySchema<typeof tagTableConfigReturn.idSchema>;
export type UserIdSchemaIsEmpty = IsEmptySchema<typeof tagTableConfigReturn.userIdSchema>;

// ================================================================
// TagToTransaction Table Config Example
// ================================================================

const tagToTransactionTableConfig = createFeatureTableConfig(tagToTransaction)
    .setIds(['tagId', 'transactionId'])
    .build();

export const tagToTransactionIdsFieldNames = tagToTransactionTableConfig.getIdsFieldNames();
export const tagToTransactionUserIdFieldName = tagToTransactionTableConfig.getUserIdFieldName();
console.log('tagToTransactionUserIdFieldName', tagToTransactionUserIdFieldName);
