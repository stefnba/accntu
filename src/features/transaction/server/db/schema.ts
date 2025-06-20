import { connectedBankAccount } from '@/features/bank/server/db/schemas';
import { transactionImportFile } from '@/features/transaction-import/server/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import {
    boolean,
    char,
    date,
    decimal,
    index,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';

export const transactionTypeEnum = pgEnum('transaction_type', ['transfer', 'credit', 'debit']);
export const transactionStatusEnum = pgEnum('transaction_status', [
    'pending',
    'completed',
    'failed',
    'cancelled',
]);
export const importSourceEnum = pgEnum('import_source', ['csv', 'api', 'manual']);

export const transaction = pgTable(
    'transaction',
    {
        id: text()
            .primaryKey()
            .notNull()
            .$defaultFn(() => createId()),
        userId: text().notNull(),
        connectedBankAccountId: text()
            .notNull()
            .references(() => connectedBankAccount.id, { onDelete: 'cascade' }),
        importFileId: text().references(() => transactionImportFile.id, {
            onDelete: 'set null',
        }),

        // Core transaction data
        date: date().notNull(),
        title: text().notNull(), // Main description
        description: text(), // Additional details
        counterparty: text(), // Other party in transaction

        // Banking details
        iban: text(), // Other party's IBAN
        bic: text(), // Other party's BIC
        reference: text(), // Transaction reference/memo

        type: transactionTypeEnum().notNull(),

        // Amount in spending currency (what was actually spent/received)
        spendingAmount: decimal({ precision: 12, scale: 2 }).notNull(),
        spendingCurrency: char({ length: 3 }).notNull(),

        // Amount in account currency (account's native currency)
        accountAmount: decimal({ precision: 12, scale: 2 }).notNull(),
        accountCurrency: char({ length: 3 }).notNull(),

        // Amount in user's base currency (for multi-currency users)
        userAmount: decimal({ precision: 12, scale: 2 }).notNull(),
        userCurrency: char({ length: 3 }).notNull(),

        // Account balance after transaction
        balance: decimal({ precision: 12, scale: 2 }),

        // Location data
        country: char({ length: 2 }),
        city: text(),

        // Categorization
        labelId: text(), // Direct label assignment (will be added after label table is created)

        // Import metadata
        importSource: importSourceEnum().notNull().default('manual'),
        importBatchId: text(), // Group transactions from same import
        bankTransactionId: text(), // Bank's unique ID
        key: text().notNull(), // Unique key for deduplication

        // Raw data from import (for debugging/reprocessing)
        rawData: jsonb().$type<Record<string, any>>(),

        // Status and flags
        status: transactionStatusEnum().notNull().default('completed'),
        isRecurring: boolean().notNull().default(false),
        isTransfer: boolean().notNull().default(false),
        linkedTransactionId: text(), // For transfers between accounts
        isNew: boolean().notNull().default(true),
        isDeleted: boolean().notNull().default(false),

        // User customizations
        note: text(), // User's personal note
        isHidden: boolean().notNull().default(false),

        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp().notNull().defaultNow(),
    },
    (table) => ({
        accountIdIdx: index('transaction_account_id_idx').on(table.connectedBankAccountId),
        dateIdx: index('transaction_date_idx').on(table.date),
        bankTransactionIdIdx: index('transaction_bank_transaction_id_idx').on(
            table.bankTransactionId
        ),
        importBatchIdIdx: index('transaction_import_batch_id_idx').on(table.importBatchId),
        userKeyUniqueIdx: uniqueIndex('transaction_user_key_unique').on(
            table.userId,
            table.key,
            table.isDeleted
        ),
    })
);

// Relations

export const transactionRelations = relations(transaction, ({ one }) => ({
    account: one(connectedBankAccount, {
        fields: [transaction.connectedBankAccountId],
        references: [connectedBankAccount.id],
    }),
    importFile: one(transactionImportFile, {
        fields: [transaction.importFileId],
        references: [transactionImportFile.id],
    }),
    // Note: label relation will be added after label table is created to avoid circular imports
}));

export type Transaction = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;
