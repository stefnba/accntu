import { connectedBankAccount } from '@/features/bank/server/db/schemas';
import { user } from '@/server/db/schemas';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

// Define enums for status columns
export const transactionImportStatusEnum = pgEnum('transaction_import_status', [
    'draft', // User has uploaded a file, but it hasn't been processed yet
    'pending', // Files have been processed, but the transactions haven't been imported yet
    'processing', // Transactions are being imported
    'completed', // Transactions have been imported
    'failed', // Transactions failed to import
]);

export const transactionImportFileStatusEnum = pgEnum('transaction_import_file_status', [
    'uploaded',
    'processing',
    'processed',
    'imported',
    'failed',
]);

export const transactionImportFileStorageTypeEnum = pgEnum('transaction_import_file_storage_type', [
    's3',
    'local',
]);

export const transactionImport = pgTable('transaction_import', {
    id: text()
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: text()
        .notNull()
        .references(() => user.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
    connectedBankAccountId: text()
        .notNull()
        .references(() => connectedBankAccount.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
    status: transactionImportStatusEnum().notNull().default('draft'),
    importedTransactionCount: integer().default(0),
    fileCount: integer().default(0),
    importedFileCount: integer().default(0),
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
            onUpdate: 'cascade',
        }),
    fileName: text().notNull(),
    fileUrl: text().notNull(),
    fileType: text().notNull(),
    fileSize: integer().notNull(),
    storageType: transactionImportFileStorageTypeEnum().notNull().default('s3'),
    status: transactionImportFileStatusEnum().notNull().default('uploaded'),
    transactionCount: integer(),
    userId: text()
        .notNull()
        .references(() => user.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
    importedTransactionCount: integer().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    successAt: timestamp({ withTimezone: true }),
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

// ====================
// Base Database Zod Schemas
// ====================

// Transaction Import
export const selectTransactionImportSchema = createSelectSchema(transactionImport);
export const insertTransactionImportSchema = createInsertSchema(transactionImport);
export const updateTransactionImportSchema = createUpdateSchema(transactionImport);

// Transaction Import File
export const selectTransactionImportFileSchema = createSelectSchema(transactionImportFile);
export const insertTransactionImportFileSchema = createInsertSchema(transactionImportFile);
export const updateTransactionImportFileSchema = createUpdateSchema(transactionImportFile);
