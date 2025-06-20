import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { connectedBankAccount } from '../../../bank/server/db/schemas';

export const transactionImport = pgTable('transaction_import', {
    id: text()
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: text().notNull(),
    connectedBankAccountId: text()
        .notNull()
        .references(() => connectedBankAccount.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }),
    status: varchar({ length: 50 }).notNull().default('pending'),
    importedTransactionCount: integer().default(0),
    fileCount: integer().default(0),
    importedFileCount: integer().default(0),
    parseErrors: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    successAt: timestamp({ withTimezone: true }),
    isActive: boolean().notNull().default(true),
});

export const transactionImportFile = pgTable('transaction_import_file', {
    id: text()
        .primaryKey()
        .$defaultFn(() => createId()),
    importId: text()
        .notNull()
        .references(() => transactionImport.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }),
    fileName: text().notNull(),
    fileUrl: text().notNull(),
    fileType: text().notNull(),
    fileSize: integer().notNull(),
    storageType: varchar({ length: 10 }).notNull().default('s3'),
    bucket: text(),
    key: text(),
    relativePath: text(),
    status: varchar({ length: 50 }).notNull().default('uploaded'),
    transactionCount: integer(),
    importedTransactionCount: integer().default(0),
    parseErrors: jsonb(),
    parsedTransactions: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    importedAt: timestamp({ withTimezone: true }),
    isActive: boolean().notNull().default(true),
});

export const transactionImportRelations = relations(transactionImport, ({ one, many }) => ({
    connectedBankAccount: one(connectedBankAccount, {
        fields: [transactionImport.connectedBankAccountId],
        references: [connectedBankAccount.id],
    }),
    files: many(transactionImportFile),
}));

export const transactionImportFileRelations = relations(transactionImportFile, ({ one }) => ({
    import: one(transactionImport, {
        fields: [transactionImportFile.importId],
        references: [transactionImport.id],
    }),
}));

export type TransactionImport = typeof transactionImport.$inferSelect;
export type NewTransactionImport = typeof transactionImport.$inferInsert;
export type TransactionImportFile = typeof transactionImportFile.$inferSelect;
export type NewTransactionImportFile = typeof transactionImportFile.$inferInsert;
