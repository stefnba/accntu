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

export const bankIntegrationTypeEnum = pgEnum('bank_integration_type', ['csv', 'api']);
export const accountTypeEnum = pgEnum('account_type', [
    'checking',
    'savings',
    'credit_card',
    'investment',
]);
export const accountStatusEnum = pgEnum('account_status', [
    'active',
    'inactive',
    'closed',
    'pending',
]);

// Global bank registry - all available banks
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

    // // API Configuration
    // apiConfig: jsonb().$type<{
    //     baseUrl?: string;
    //     authType?: 'oauth2' | 'api_key' | 'basic';
    //     scopes?: string[];
    //     endpoints?: {
    //         accounts?: string;
    //         transactions?: string;
    //         balance?: string;
    //     };
    // }>(),

    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
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
    csvConfig: jsonb().$type<{
        delimiter?: string;
        hasHeader?: boolean;
        encoding?: string; // 'utf-8', 'iso-8859-1', etc.
        skipRows?: number; // Number of rows to skip from top
        dateFormat?: string; // Expected date format in CSV
        decimalSeparator?: '.' | ',';
        thousandsSeparator?: ',' | '.' | ' ';
        quoteChar?: string;
        escapeChar?: string;
        nullValues?: string[]; // Values to treat as NULL
    }>(),

    // Sample data for testing/validation
    sampleCsvData: text(), // Sample CSV rows for testing

    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

// User's connection to a specific bank
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
        apiCredentials: jsonb().$type<{
            accessToken?: string;
            refreshToken?: string;
            apiKey?: string;
            institutionId?: string; // Provider's institution ID
            expiresAt?: Date;
        }>(),

        isActive: boolean().notNull().default(true),
        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp().notNull().defaultNow(),
    },
    (table) => [uniqueIndex('connected_bank_user_bank_unique').on(table.userId, table.globalBankId)]
);

// User's actual accounts within a connected bank
export const connectedBankAccount = pgTable('connected_bank_account', {
    id: text()
        .primaryKey()
        .notNull()
        .$defaultFn(() => createId()),
    connectedBankId: text()
        .notNull()
        .references(() => connectedBank.id, { onDelete: 'cascade' }),
    globalBankAccountId: text().references(() => globalBankAccount.id, {
        onDelete: 'set null',
    }),

    name: text().notNull(), // User-defined name like "Main Checking"
    description: text(),
    type: accountTypeEnum().notNull(),

    // Account identifiers
    accountNumber: text(), // Masked/partial for display
    iban: text(), // International Bank Account Number
    routingNumber: text(),

    // Balance tracking
    currentBalance: decimal({ precision: 12, scale: 2 }),
    availableBalance: decimal({ precision: 12, scale: 2 }),
    creditLimit: decimal({ precision: 12, scale: 2 }), // For credit cards
    currency: char({ length: 3 }).notNull().default('USD'),

    // Provider account details
    providerAccountId: text(), // Provider's account ID

    // Custom CSV parsing overrides (if different from global template)
    customCsvConfig: jsonb().$type<{
        duckdbQuery?: string; // Override DuckDB query
        fieldMappings?: any; // Override field mappings
        csvConfig?: any; // Override CSV config
    }>(),

    status: accountStatusEnum().notNull().default('active'),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

// Relations
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

export const connectedBankAccountRelations = relations(connectedBankAccount, ({ one }) => ({
    connectedBank: one(connectedBank, {
        fields: [connectedBankAccount.connectedBankId],
        references: [connectedBank.id],
    }),
    globalBankAccount: one(globalBankAccount, {
        fields: [connectedBankAccount.globalBankAccountId],
        references: [globalBankAccount.id],
    }),
}));

export type GlobalBank = typeof globalBank.$inferSelect;
export type NewGlobalBank = typeof globalBank.$inferInsert;
export type GlobalBankAccount = typeof globalBankAccount.$inferSelect;
export type NewGlobalBankAccount = typeof globalBankAccount.$inferInsert;
export type ConnectedBank = typeof connectedBank.$inferSelect;
export type NewConnectedBank = typeof connectedBank.$inferInsert;
export type ConnectedBankAccount = typeof connectedBankAccount.$inferSelect;
export type NewConnectedBankAccount = typeof connectedBankAccount.$inferInsert;
