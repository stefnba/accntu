import { connectedBankAccount } from '@/features/bank/server/db/schemas';
import { bucketTransaction } from '@/features/bucket/server/db/schemas';
import { transactionImportFile } from '@/features/transaction-import/server/db/schemas';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import {
    boolean,
    char,
    date,
    index,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export const transactionTypeEnum = pgEnum('transaction_type', ['transfer', 'credit', 'debit']);
export const transactionStatusEnum = pgEnum('transaction_status', [
    'pending',
    'completed',
    'failed',
    'cancelled',
]);
export const importSourceEnum = pgEnum('import_source', ['csv', 'api']);

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
        importFileId: text()
            .notNull()
            .references(() => transactionImportFile.id, {
                onDelete: 'set null',
            }),

        // Core transaction data
        date: date().notNull(),
        title: text().notNull(), // Main description
        originalTitle: text().notNull(), // Original title from the import file
        description: text(), // Additional details
        note: text(), // User's personal note

        // Banking details
        iban: text(), // Other party's IBAN
        bic: text(), // Other party's BIC
        reference: text(), // Transaction reference/memo
        counterparty: text(), // Other party in transaction

        // Transaction type
        type: transactionTypeEnum().notNull(),

        // Amount in spending currency (what was actually spent/received)
        spendingAmount: numeric({ precision: 12, scale: 2 }).notNull(),
        spendingCurrency: char({ length: 3 }).notNull(),

        // Amount in account currency (account's native currency)
        accountAmount: numeric({ precision: 12, scale: 2 }).notNull(),
        accountCurrency: char({ length: 3 }).notNull(),

        // Amount in user's base currency (for multi-currency users)
        userAmount: numeric({ precision: 12, scale: 2 }).notNull(),
        userCurrency: char({ length: 3 }).notNull(),

        // Account balance after transaction
        balance: numeric({ precision: 12, scale: 2 }),

        // Location data
        country: char({ length: 2 }),
        city: text(),

        // Categorization
        labelId: text(), // Direct label assignment (will be added after label table is created)
        // bucketId removed - now using junction table bucketTransaction

        // Import metadata
        providerTransactionId: text(), // Bank's unique ID
        key: text().notNull(), // Unique key for deduplication

        // Status and flags
        status: transactionStatusEnum().notNull().default('completed'),
        linkedTransactionId: text(), // For transfers between accounts
        isNew: boolean().notNull().default(true),
        isActive: boolean().notNull().default(true),
        isHidden: boolean().notNull().default(false),

        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp(),
    },
    (table) => [
        index('transaction_account_id_idx').on(table.connectedBankAccountId),
        index('transaction_date_idx').on(table.date),
        index('transaction_provider_transaction_id_idx').on(table.providerTransactionId),
        uniqueIndex('transaction_user_key_unique').on(table.userId, table.key, table.isActive),
    ]
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
    bucketTransaction: one(bucketTransaction, {
        fields: [transaction.id],
        references: [bucketTransaction.transactionId],
    }),
    // Note: label relation will be added after label table is created to avoid circular imports
}));

// ===============================
// Base Zod Schemas
// ===============================

export const selectTransactionSchema = createSelectSchema(transaction);
export const insertTransactionSchema = createInsertSchema(transaction);
export const updateTransactionSchema = createUpdateSchema(transaction);
