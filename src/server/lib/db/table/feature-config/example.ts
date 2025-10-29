import { tag } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import {
    InferCreateInput,
    InferOptionalSchema,
    InferReturnColums,
    InferUpdateInput,
    IsEmptySchema,
} from '@/server/lib/db/table/feature-config/types';

/**
 * Example: Create a feature table configuration for the tag table.
 *
 * This fluent API allows you to:
 * - Define which fields are IDs (.setIds)
 * - Define which field is the user ID for row-level security (.setUserId)
 * - Restrict which fields can be inserted/updated (.defineUpsertData)
 * - Specify which columns to return in queries (.defineReturnColumns)
 */
const config = createFeatureTableConfig(tag)
    .setIds(['id'])
    .setUserId('userId')
    .defineUpsertData(['name', 'description', 'color'])
    .defineReturnColumns(['id', 'name', 'description', 'color', 'transactionCount'])
    .build();

/**
 * All schemas are always ZodObject (never undefined).
 * This enables zero-assertion type safety internally.
 */
const idSchema = config.idSchema;
const userIdSchema = config.userIdSchema;
const baseSchema = config.baseSchema;
const insertSchema = config.insertSchema;
const updateSchema = config.updateSchema;
const selectSchema = config.selectSchema;

/**
 * Use InferSchemaIfExists helper for clean undefined semantics.
 * Returns undefined if schema is empty, inferred type otherwise.
 */
type TIdType = InferOptionalSchema<typeof idSchema>; // { id: string }
type TUserIdType = InferOptionalSchema<typeof userIdSchema>; // { userId: string }

type TIsEmptySchema = IsEmptySchema<typeof userIdSchema>; // false (userId is set)

/**
 * Example: When IDs are not configured, helper returns undefined
 */
const configNoIds = createFeatureTableConfig(tag).build();
type TNoIdType = InferOptionalSchema<typeof configNoIds.idSchema>; // undefined

/**
 * Type guards allow runtime checks that narrow TypeScript types.
 *
 * @example
 * ```ts
 * if (config.hasIds()) {
 *   // TypeScript knows idSchema is non-empty here
 *   const ids = config.idSchema; // ZodObject with actual id fields
 * }
 * ```
 */
if (config.hasIds()) {
    // TypeScript knows idSchema is non-empty here
    const _ids = config.idSchema;
}

// Example: Use the inferred types
type Input = InferCreateInput<typeof config>;
type UpdateInput = InferUpdateInput<typeof config>;

// Example: Valid update input matching the inferred type
const updateInput: UpdateInput = {
    data: {
        name: 'test',
    },
    ids: { id: '123' },
    userId: 'test',
};

/**
 * Example function using the inferred create input type.
 * TypeScript enforces the correct shape at compile time.
 */
const createTag = (input: Input) => {
    return input;
};

type ReturnColumns = InferReturnColums<typeof config>;

// Example: Call with properly typed data
createTag({
    data: {
        name: 'test',
        description: 'test',
        color: 'test',
    },
    userId: 'test',
});

// Example: Get the return columns array at runtime
const returnColumns = config.getReturnColumns();
console.log(returnColumns);
