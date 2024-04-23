import { InferSelectModel } from 'drizzle-orm';

import * as dbSchema from './schema';

export type Transaction = InferSelectModel<typeof dbSchema.transaction>;

export type TransactionAccount = InferSelectModel<
    typeof dbSchema.transactionAccount
>;

export type BankUploadAccounts = InferSelectModel<
    typeof dbSchema.bankUploadAccounts
>;
