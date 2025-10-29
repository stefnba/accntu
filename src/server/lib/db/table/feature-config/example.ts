import { tag } from '@/server/db/tables';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { InferSchemaIfExists, IsEmptySchema } from '@/server/lib/db/table/feature-config/types';

const config = createFeatureTableConfig(tag)
    .setIds(['id'])
    // .setUserId('userId')
    .defineUpsertData(['name', 'description', 'color'])
    .defineReturnColumns(['id', 'name', 'description', 'color', 'transactionCount'])
    .build();

// Schemas are always ZodObject (never undefined)
const idSchema = config.idSchema;
const userIdSchema = config.userIdSchema;
const baseSchema = config.baseSchema;
const insertSchema = config.insertSchema;
const updateSchema = config.updateSchema;
const selectSchema = config.selectSchema;

// Use helper type for clean undefined semantics
type TIdType = InferSchemaIfExists<typeof idSchema>; // { id: string }
type TUserIdType = InferSchemaIfExists<typeof userIdSchema>; // undefined

type TIsEmptySchema = IsEmptySchema<typeof userIdSchema>; // true

// When not set, helper returns undefined
const configNoIds = createFeatureTableConfig(tag).build();
type TNoIdType = InferSchemaIfExists<typeof configNoIds.idSchema>; // undefined

// Type guards work too
if (config.hasIds()) {
    // TypeScript knows idSchema is non-empty here
    const _ids = config.idSchema;
}
