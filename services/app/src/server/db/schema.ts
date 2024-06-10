import { count } from 'console';
import { relations } from 'drizzle-orm';
import {
    AnyPgColumn,
    boolean,
    char,
    date,
    doublePrecision,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const OAuthProvider = pgEnum('OAuthProvider', ['GITHUB']);
export const OAuthProviderSchema = z.enum(OAuthProvider.enumValues);

export const LoginMethod = pgEnum('LoginMethod', ['GITHUB_OAUTH', 'EMAIL_OTP']);
export const LoginMethodSchema = z.enum(LoginMethod.enumValues);

export const UserRole = pgEnum('UserRole', ['USER', 'ADMIN']);
export const UserRoleSchema = z.enum(UserRole.enumValues);

export const Apparance = pgEnum('Apparance', ['SYSTEM', 'DARK', 'LIGHT']);
export const ApparanceSchema = z.enum(Apparance.enumValues);

export const Language = pgEnum('Language', ['EN']);
export const LanguageSchema = z.enum(Language.enumValues);

export const ConnectedAccountType = pgEnum('ConnectedAccountType', [
    'CREDIT_CARD',
    'SAVING',
    'CURRENT'
]);
export const ConnectedAccountTypeSchema = z.enum(
    ConnectedAccountType.enumValues
);

export const TransactionType = pgEnum('TransactionType', [
    'TRANSFER',
    'CREDIT',
    'DEBIT'
]);
export const TransactionTypeSchema = z.enum(TransactionType.enumValues);

export const user = pgTable(
    'user',
    {
        id: text('id').primaryKey().notNull(),
        firstName: text('firstName'),
        lastName: text('lastName'),
        email: text('email').notNull(),
        emailVerifiedAt: timestamp('emailVerifiedAt', {
            precision: 3,
            mode: 'date'
        }),
        image: text('image'),
        role: UserRole('role').default('USER').notNull(),
        createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updatedAt', {
            precision: 3,
            mode: 'date'
        }),
        isEnabled: boolean('isEnabled').default(true).notNull(),
        lastLoginAt: timestamp('lastLoginAt', { precision: 3, mode: 'date' }),
        loginAttempts: integer('loginAttempts').default(0).notNull()
    },
    (table) => {
        return {
            emailKey: uniqueIndex('user_email_key').on(table.email)
        };
    }
);
export const usersRelations = relations(user, ({ one, many }) => ({
    settings: one(userSetting, {
        fields: [user.id],
        references: [userSetting.userId]
    }),
    sessions: many(session),
    logins: many(login),
    oauthAccounts: many(oauthAccount),
    transactions: many(transaction)
}));
export const SelectUserSchema = createSelectSchema(user);
export const InsertUserSchema = createInsertSchema(user);

export const session = pgTable('session', {
    id: text('id').primaryKey().notNull(),
    // todo create token to be used as a key not id
    userId: text('userId')
        .notNull()
        .references(() => user.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }),
    expiresAt: timestamp('expiresAt', {
        precision: 3,
        mode: 'date'
    }).notNull()
});
export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id]
    })
}));
export const SelectSessionSchema = createSelectSchema(session);
export const InsertSessionSchema = createInsertSchema(session);

export const userSetting = pgTable(
    'user_setting',
    {
        userId: text('userId')
            .notNull()
            .references(() => user.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }),
        timezone: text('timezone'),
        language: Language('language').default('EN'),
        apparance: Apparance('apparance').default('LIGHT')
    },
    (table) => {
        return {
            userIdKey: uniqueIndex('user_setting_userId_key').on(table.userId)
        };
    }
);
export const SelectUserSettingsSchema = createSelectSchema(userSetting);
export const InsertUserSettingsSchema = createInsertSchema(userSetting);

export const login = pgTable('login', {
    id: text('id').primaryKey().notNull(),
    // todo create token to be used as a key not id
    method: LoginMethod('method').notNull(),
    userId: text('userId').references(() => user.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
    }),
    identifier: text('identifier'),
    device: text('device'),
    ip: text('ip'),
    location: text('location'),
    userAgent: text('userAgent'),
    attemptedAt: timestamp('attemptedAt', { precision: 3, mode: 'date' })
        .defaultNow()
        .notNull(),
    successAt: timestamp('successAt', { precision: 3, mode: 'date' })
});
export const loginRelations = relations(login, ({ one }) => ({
    user: one(user, {
        fields: [login.userId],
        references: [user.id]
    })
}));
export const SelectLoginSchema = createSelectSchema(login);
export const InsertLoginSchema = createInsertSchema(login).omit({ id: true });

export const oauthAccount = pgTable('oauth_account', {
    id: text('id').primaryKey().notNull(),
    userId: text('userId')
        .notNull()
        .references(() => user.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }),
    provider: OAuthProvider('provider').notNull(),
    providerUserId: text('providerUserId').notNull()
});
export const oauthAccountRelations = relations(oauthAccount, ({ one }) => ({
    user: one(user, {
        fields: [oauthAccount.userId],
        references: [user.id]
    })
}));
export const SelectoauthAccountSchema = createSelectSchema(oauthAccount);
export const InsertoauthAccountSchema = createInsertSchema(oauthAccount).omit({
    id: true
});

export const verificationToken = pgTable(
    'verification_token',
    {
        identifier: text('identifier').notNull(),
        token: text('token').notNull(),
        code: text('code').notNull(),
        expiresAt: timestamp('expiresAt', {
            precision: 3,
            mode: 'date'
        }).notNull()
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.identifier, table.token] })
        };
    }
);

export const bank = pgTable('bank', {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull(),
    country: char('country', { length: 2 }).notNull(),
    bic: text('bic'),
    color: text('color'),
    logo: text('logo'),
    providerSource: text('providerSource'),
    providerId: text('providerId'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updatedAt', {
        precision: 3,
        mode: 'date'
    })
});
export const bankRelations = relations(bank, ({ many }) => ({
    accounts: many(bankUploadAccount)
}));
export const SelectBankSchema = createSelectSchema(bank);

export const bankUploadAccount = pgTable('bank_upload_account', {
    id: text('id').primaryKey().notNull(),
    type: ConnectedAccountType('type').notNull(),
    parserKey: text('parserKey').notNull(),
    bankId: text('bankId')
        .notNull()
        .references(() => bank.id, {
            onDelete: 'restrict',
            onUpdate: 'cascade'
        }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updatedAt', {
        precision: 3,
        mode: 'date'
    })
});
export const bankUploadAccountsRelations = relations(
    bankUploadAccount,
    ({ one }) => ({
        import: one(bank, {
            fields: [bankUploadAccount.bankId],
            references: [bank.id]
        })
    })
);
export const SelectBankUploadAccountsSchema =
    createSelectSchema(bankUploadAccount);

export const connectedBank = pgTable('connected_bank', {
    id: text('id').primaryKey().notNull(),
    bankId: text('bankId')
        .notNull()
        .references(() => bank.id, {
            onDelete: 'restrict',
            onUpdate: 'cascade'
        }),
    userId: text('userId')
        .notNull()
        .references(() => user.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updatedAt', {
        precision: 3,
        mode: 'date'
    })
});
export const connectedBankRelations = relations(
    connectedBank,
    ({ many, one }) => ({
        accounts: many(connectedAccount),
        bank: one(bank, {
            fields: [connectedBank.bankId],
            references: [bank.id]
        })
    })
);
export const SelectConnectedBankSchema = createSelectSchema(connectedBank);
export const InsertConnectedBankSchema = createInsertSchema(connectedBank);

export const connectedAccount = pgTable('connected_account', {
    id: text('id').primaryKey().notNull(),
    bankId: text('bankId')
        .notNull()
        .references(() => connectedBank.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }),
    name: text('name').notNull(),
    description: text('description'),
    type: ConnectedAccountType('type').notNull(),
    parserKey: text('parserKey'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updatedAt', {
        precision: 3,
        mode: 'date'
    })
});
export const connectedAccountRelations = relations(
    connectedAccount,
    ({ one }) => ({
        import: one(connectedBank, {
            fields: [connectedAccount.bankId],
            references: [connectedBank.id]
        })
    })
);
export const SelectConnectedAccountSchema =
    createSelectSchema(connectedAccount);
export const InsertConnectedAccountSchema =
    createInsertSchema(connectedAccount);

export const transactionImportFile = pgTable('import_file', {
    id: text('id').primaryKey().notNull(),
    url: text('url').notNull(),
    importId: text('importId')
        .references(() => transactionImport.id, {
            onDelete: 'set null',
            onUpdate: 'cascade'
        })
        .notNull(),
    filename: text('filename').notNull(),
    type: text('type').notNull(),
    importedAt: timestamp('importedAt', { precision: 3, mode: 'date' }),
    transactionCount: integer('transactionCount'),
    importedTransactionCount: integer('importedTransactionCount'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updatedAt', {
        precision: 3,
        mode: 'date'
    })
});
export const transactionImportFileRelations = relations(
    transactionImportFile,
    ({ one, many }) => ({
        import: one(transactionImport, {
            fields: [transactionImportFile.importId],
            references: [transactionImport.id]
        }),
        transactions: many(transaction)
    })
);
export const SelectTransactionImportFileSchema = createSelectSchema(
    transactionImportFile
);
export const InsertTransactionImportFileSchema = createInsertSchema(
    transactionImportFile
);

export const transactionImport = pgTable('import', {
    id: text('id').primaryKey().notNull(),
    userId: text('userId')
        .notNull()
        .references(() => user.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }),
    accountId: text('accountId')
        .notNull()
        .references(() => connectedAccount.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }),
    importedTransactionCount: integer('importedTransactionCount'),
    fileCount: integer('fileCount'),
    importedFileCount: integer('importedFileCount'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
        .defaultNow()
        .notNull(),
    successAt: timestamp('successAt', { precision: 3, mode: 'date' })
});
export const transactionImportRelations = relations(
    transactionImport,
    ({ many }) => ({
        files: many(transactionImportFile)
    })
);
export const SelectTransactionImportSchema =
    createSelectSchema(transactionImport);
export const InsertTransactionImportSchema =
    createInsertSchema(transactionImport);

export const transaction = pgTable(
    'transaction',
    {
        id: text('id').primaryKey().notNull(),
        userId: text('userId')
            .notNull()
            .references(() => user.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }),
        accountId: text('accountId')
            .notNull()
            .references(() => connectedAccount.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }),
        importFileId: text('importFileId')
            .notNull()
            .references(() => transactionImportFile.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }),
        date: date('date').notNull(),
        title: text('title').notNull(),
        type: TransactionType('type').notNull(),
        spendingAmount: integer('spendingAmount').notNull(),
        spendingCurrency: char('spendingCurrency', { length: 3 }).notNull(),
        accountAmount: integer('accountAmount').notNull(),
        accountCurrency: char('accountCurrency', { length: 3 }).notNull(),
        userAmount: integer('userAmount').notNull(),
        userCurrency: char('userCurrency', { length: 3 }).notNull(),
        createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' }),
        key: text('key').notNull(),
        note: text('note'),
        country: char('country', { length: 2 }),
        city: text('city'),
        labelId: text('labelId').references(() => label.id, {
            onDelete: 'set null',
            onUpdate: 'cascade'
        }),
        isNew: boolean('isNew').default(true).notNull(),
        isDeleted: boolean('isDeleted').default(false).notNull()
    },
    (table) => {
        return {
            userIdKeyIsDeletedKey: uniqueIndex(
                'transaction_userId_key_isDeleted_key'
            ).on(table.userId, table.key, table.isDeleted)
        };
    }
);
export const transactionRelations = relations(transaction, ({ one }) => ({
    user: one(user, {
        fields: [transaction.userId],
        references: [user.id]
    }),
    label: one(label, {
        fields: [transaction.labelId],
        references: [label.id]
    }),
    importFile: one(transactionImportFile, {
        fields: [transaction.importFileId],
        references: [transactionImportFile.id]
    })
}));
export const SelectTransactionSchema = createSelectSchema(transaction);
export const InsertTransactionSchema = createInsertSchema(transaction).omit({
    userId: true,
    accountId: true,
    importFileId: true,
    id: true
});

export const label = pgTable('label', {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull(),
    color: text('color'),
    rank: integer('rank').default(0).notNull(),
    level: integer('level').default(0).notNull(),
    userId: text('userId')
        .notNull()
        .references(() => user.id, {
            onDelete: 'restrict',
            onUpdate: 'cascade'
        }),
    description: text('description'),
    parentId: text('parentId').references((): AnyPgColumn => label.id),
    firstParentId: text('firstParentId').references(
        (): AnyPgColumn => label.id
    ),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updatedAt', {
        precision: 3,
        mode: 'date'
    }),
    isDeleted: boolean('isDeleted').default(false).notNull()
});
export const labelRelations = relations(label, ({ many, one }) => ({
    childLabels: many(label, { relationName: 'childLabels' }),
    transactions: many(transaction),
    parentLabel: one(label, {
        fields: [label.parentId],
        references: [label.id],
        relationName: 'childLabels'
    })
}));
export const SelectLabelSchema = createSelectSchema(label);
export const InsertLabelSchema = createInsertSchema(label);
