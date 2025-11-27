import { tag, tagToTransaction } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import {
    InferCreateInput,
    InferIdsInput,
    InferManyFiltersInput,
    InferOptionalShape,
    InferReturnColums,
    InferTableFromConfig,
    InferUpdateInput,
    IsEmptyShape,
} from '@/server/lib/db/table/feature-config/types';
import z from 'zod';

// ================================================================
// Table Config
// ================================================================

const tagTableConfig = createFeatureTableConfig(tag)
    .omitBaseSchema(['transactionCount'])
    // .removeIds()
    // .removeUserId()
    .restrictReturnColumns(['name', 'color', 'userId', 'id'])
    .restrictUpdateFields(['name', 'description'])
    .restrictInsertFields(['name'])
    // .restrictUpsertFields(['name', 'description'])
    .enableFiltering({
        createdAt: z.date(),
        name: z.string(),
        startDate: z.date(),
    })
    .enablePagination()
    .enableOrdering(['createdAt'])
    // .setIds(['id'])
    // .setUserId('userId')
    .build();

export const tagTableConfigReturn = {
    returnColums: tagTableConfig.getReturnColumns(),
    userIdFieldName: tagTableConfig.getUserIdFieldName(),
    idsFieldNames: tagTableConfig.getIdsFieldNames(),
    // schemas
    baseSchema: tagTableConfig.getBaseSchema(),
    idSchema: tagTableConfig.getIdSchema(),
    userIdSchema: tagTableConfig.getUserIdSchema(),
    insertDataSchema: tagTableConfig.getCreateDataSchema(),
    updateDataSchema: tagTableConfig.getUpdateDataSchema(),
    selectReturnSchema: tagTableConfig.getReturnColumnsSchema(),
    manyFiltersSchema: tagTableConfig.getFiltersSchema(),
    paginationSchema: tagTableConfig.getPaginationSchema(),
    orderingSchema: tagTableConfig.getOrderingSchema(),

    identifierSchema: tagTableConfig.buildIdentifierSchema(),
    // input schemas
    createSchema: tagTableConfig.buildCreateInputSchema(),
    createManySchema: tagTableConfig.buildCreateManyInputSchema(),
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
    IdSchema: InferOptionalShape<typeof tagTableConfig.config.id>;
    userIdSchema: InferOptionalShape<typeof tagTableConfig.config.userId>;
};

export type IdSchemaIsEmpty = IsEmptyShape<typeof tagTableConfig.config.id>;
export type UserIdSchemaIsEmpty = IsEmptyShape<typeof tagTableConfig.config.userId>;

// ================================================================
// Validate
// ================================================================

const validateManyFiltersInput = tagTableConfig.validateFiltersInput({
    filters: {
        createdAt: new Date(),
        name: 'Test',
        startDate: new Date(),
    },
});
console.log('validateManyFiltersInput', validateManyFiltersInput);

const validateOrderingInput = tagTableConfig.validateOrderingInput({
    ordering: [{ field: 'createdAt', direction: 'desc' }],
});
console.log('validateOrderingInput', validateOrderingInput);

// ================================================================
// TagToTransaction Table Config Example
// ================================================================

const tagToTransactionTableConfig = createFeatureTableConfig(tagToTransaction)
    .setIds(['tagId', 'transactionId'])
    .build();

export const tagToTransactionIdsFieldNames = tagToTransactionTableConfig.getIdsFieldNames();
export const tagToTransactionUserIdFieldName = tagToTransactionTableConfig.getUserIdFieldName();
console.log('tagToTransactionUserIdFieldName', tagToTransactionUserIdFieldName);

// ================================================================
// Tag Table Config Example with Transform
// ================================================================

const tagTableConfigWithTransform = createFeatureTableConfig(tag)
    .omitBaseSchema(['transactionCount'])
    .transformBaseSchema(() =>
        z.object({
            name: z.string().min(1, 'Name cannot be empty'),
            color: z.string().min(1, 'Color cannot be empty'),
            test: z.string().min(1, 'Test cannot be empty'),
        })
    )
    .build();

export const update = tagTableConfigWithTransform.getUpdateDataSchema();
export const create = tagTableConfigWithTransform.getCreateDataSchema();
export const base = tagTableConfigWithTransform.getBaseSchema();
