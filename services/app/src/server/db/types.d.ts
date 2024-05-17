import { InferSelectModel } from 'drizzle-orm';
import type {
    BuildQueryResult,
    DBQueryConfig,
    ExtractTablesWithRelations
} from 'drizzle-orm';
import { z } from 'zod';

import * as dbSchema from './schema';

type Schema = typeof dbSchema;
type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
    'one' | 'many',
    boolean,
    TSchema,
    TSchema[TableName]
>['with'];

/**
 * Infer the result type of a query with relations.
 */
export type InferResultType<
    TableName extends keyof TSchema,
    With extends IncludeRelation<TableName> | undefined = undefined
> = BuildQueryResult<
    TSchema,
    TSchema[TableName],
    {
        with: With;
    }
>;

export type Transaction = InferSelectModel<typeof dbSchema.transaction>;

export type ConnectedAccount = InferSelectModel<
    typeof dbSchema.connectedAccount
>;

export type BankUploadAccounts = InferSelectModel<
    typeof dbSchema.bankUploadAccounts
>;

export type Label = InferSelectModel<typeof dbSchema.label>;

/**
 * Enum types
 */

export type OAuthProvider = z.infer<typeof dbSchema.OAuthProviderSchema>;
export type LoginMethod = z.infer<typeof dbSchema.LoginMethodSchema>;
export type TransactionType = z.infer<typeof dbSchema.TransactionTypeSchema>;
export type Language = z.infer<typeof dbSchema.LanguageSchema>;
export type ConnectedAccountType = z.infer<
    typeof dbSchema.connectedAccountSchema
>;
