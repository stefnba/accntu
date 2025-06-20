import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { boolean, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { connectedBankAccount } from '../../../bank/server/db/schemas';

export const transactionImports = pgTable('transaction_imports', {
    id: varchar('id', { length: 128 })
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: varchar('user_id', { length: 128 }).notNull(),
    connectedBankAccountId: varchar('connected_bank_account_id', { length: 128 }).notNull(),
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(),
    fileSize: text('file_size'),
    status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, processing, completed, failed
    totalRecords: text('total_records'),
    successfulRecords: text('successful_records'),
    failedRecords: text('failed_records'),
    parseErrors: jsonb('parse_errors'),
    parsedTransactions: jsonb('parsed_transactions'),
    importedTransactions: jsonb('imported_transactions'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean('is_active').notNull().default(true),
});

export const transactionImportRelations = relations(transactionImports, ({ one }) => ({
    connectedBankAccount: one(connectedBankAccount, {
        fields: [transactionImports.connectedBankAccountId],
        references: [connectedBankAccount.id],
    }),
}));

export type TransactionImport = typeof transactionImports.$inferSelect;
export type NewTransactionImport = typeof transactionImports.$inferInsert;
