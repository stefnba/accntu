import { type TApiCredentials } from '@/features/bank/schemas/connected-bank';
import { type TTransformConfig } from '@/features/bank/schemas/global-bank-account';
import { transactionImport } from '@/features/transaction-import/server/db/schemas';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import {
    boolean,
    char,
    decimal,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export const bankIntegrationTypeEnum = pgEnum('bank_integration_type', ['csv', 'api']);
export const accountTypeEnum = pgEnum('account_type', [
    'checking',
    'savings',
    'credit_card',
    'investment',
]);

// ===============================
// Global bank registry - all available banks
// ===============================
export const globalBank = pgTable('global_bank', {
    id: text()
        .primaryKey()
        .notNull()
        .$defaultFn(() => createId()),
    name: text().notNull(),
    country: char({ length: 2 }).notNull(), // ISO country code
    currency: char({ length: 3 }).notNull(), // ISO currency code
    bic: text(), // Bank Identifier Code
    logo: text(), // Logo URL
    color: text(), // Brand color

    // Provider integration details
    providerSource: text(), // e.g., 'nordigen', 'plaid', 'manual'
    providerId: text(), // Provider's bank ID

    integrationTypes: bankIntegrationTypeEnum().notNull(),

    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp(),
});

// Account templates for each global bank with CSV parsing support
export const globalBankAccount = pgTable('global_bank_account', {
    id: text()
        .primaryKey()
        .notNull()
        .$defaultFn(() => createId()),
    globalBankId: text()
        .notNull()
        .references(() => globalBank.id, { onDelete: 'cascade' }),
    type: accountTypeEnum().notNull(),
    name: text().notNull(), // e.g., "Current Account", "Credit Card"
    description: text(),

    // DuckDB SQL Query for CSV parsing
    transformQuery: text().notNull(),

    // CSV metadata and configuration
    transformConfig: jsonb().$type<TTransformConfig>(),

    // Sample data for testing/validation
    sampleTransformData: text(), // Sample CSV rows for testing

    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp(),
});

// ===============================
// User's connection to a specific bank
// ===============================
export const connectedBank = pgTable(
    'connected_bank',
    {
        id: text()
            .primaryKey()
            .notNull()
            .$defaultFn(() => createId()),
        userId: text().notNull(), // From auth system
        globalBankId: text()
            .notNull()
            .references(() => globalBank.id, { onDelete: 'restrict' }),

        // API credentials (encrypted)
        apiCredentials: jsonb().$type<TApiCredentials>(),

        isActive: boolean().notNull().default(true),
        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp(),
    },
    (table) => [uniqueIndex('connected_bank_user_bank_unique').on(table.userId, table.globalBankId)]
);

// User's actual accounts within a connected bank
export const connectedBankAccount = pgTable('connected_bank_account', {
    id: text()
        .primaryKey()
        .notNull()
        .$defaultFn(() => createId()),
    userId: text().notNull(),
    connectedBankId: text()
        .notNull()
        .references(() => connectedBank.id, { onDelete: 'cascade' }),
    globalBankAccountId: text().references(() => globalBankAccount.id, {
        onDelete: 'set null',
    }),

    name: text().notNull(), // User-defined name like "Main Checking"
    description: text(),
    type: accountTypeEnum(), // globalBankAccount has type already, but we can override it here
    currency: char({ length: 3 }), // globalBankAccount has currency already, but we can override it here

    // Account identifiers
    accountNumber: text(),
    iban: text(), // International Bank Account Number

    // Balance tracking
    currentBalance: decimal({ precision: 12, scale: 2 }),

    // Provider account details
    providerAccountId: text(), // Provider's account ID used for API only

    isSharedAccount: boolean().notNull().default(false), // Whether the account is shared with other people

    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp(),
});

// ===============================
// Relations
// ===============================
export const globalBankRelations = relations(globalBank, ({ many }) => ({
    globalBankAccounts: many(globalBankAccount),
    connectedBanks: many(connectedBank),
}));

export const globalBankAccountRelations = relations(globalBankAccount, ({ one, many }) => ({
    globalBank: one(globalBank, {
        fields: [globalBankAccount.globalBankId],
        references: [globalBank.id],
    }),
    connectedBankAccounts: many(connectedBankAccount),
}));

export const connectedBankRelations = relations(connectedBank, ({ one, many }) => ({
    globalBank: one(globalBank, {
        fields: [connectedBank.globalBankId],
        references: [globalBank.id],
    }),
    connectedBankAccounts: many(connectedBankAccount),
}));

export const connectedBankAccountRelations = relations(connectedBankAccount, ({ one, many }) => ({
    connectedBank: one(connectedBank, {
        fields: [connectedBankAccount.connectedBankId],
        references: [connectedBank.id],
    }),
    globalBankAccount: one(globalBankAccount, {
        fields: [connectedBankAccount.globalBankAccountId],
        references: [globalBankAccount.id],
    }),
    transactionImports: many(transactionImport),
}));

// ===============================
// Base Zod Schemas
// ===============================

// Global Bank schemas
export const selectGlobalBankSchema = createSelectSchema(globalBank);
export const insertGlobalBankSchema = createInsertSchema(globalBank);
export const updateGlobalBankSchema = createUpdateSchema(globalBank);

// Global Bank Account schemas
export const selectGlobalBankAccountSchema = createSelectSchema(globalBankAccount);
export const insertGlobalBankAccountSchema = createInsertSchema(globalBankAccount);
export const updateGlobalBankAccountSchema = createUpdateSchema(globalBankAccount);

// Connected Bank schemas
export const selectConnectedBankSchema = createSelectSchema(connectedBank);
export const insertConnectedBankSchema = createInsertSchema(connectedBank);
export const updateConnectedBankSchema = createUpdateSchema(connectedBank);

// Connected Bank Account schemas
export const selectConnectedBankAccountSchema = createSelectSchema(connectedBankAccount);
export const insertConnectedBankAccountSchema = createInsertSchema(connectedBankAccount);
export const updateConnectedBankAccountSchema = createUpdateSchema(connectedBankAccount);

// ===============================
// Base Type
// ===============================

export type TGlobalBank = typeof globalBank.$inferSelect;
export type TGlobalBankAccount = typeof globalBankAccount.$inferSelect;
export type TConnectedBank = typeof connectedBank.$inferSelect;
export type TConnectedBankAccount = typeof connectedBankAccount.$inferSelect;
