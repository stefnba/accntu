import { relations, sql } from 'drizzle-orm';
import {
    AnyPgColumn,
    boolean,
    char,
    date,
    doublePrecision,
    foreignKey,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid
} from 'drizzle-orm/pg-core';

export const OAuthProvider = pgEnum('OAuthProvider', ['GITHUB']);
export const LoginMethod = pgEnum('LoginMethod', ['GITHUB', 'EMAIL']);
export const UserRole = pgEnum('UserRole', ['USER', 'ADMIN']);
export const Apparance = pgEnum('Apparance', ['SYSTEM', 'DARK', 'LIGHT']);
export const Language = pgEnum('Language', ['EN']);
export const TransactionAccountType = pgEnum('TransactionAccountType', [
    'CREDIT_CARD',
    'SAVING',
    'CURRENT'
]);
export const TransactionType = pgEnum('TransactionType', [
    'TRANSFER',
    'CREDIT',
    'DEBIT'
]);

export const user = pgTable(
    'user',
    {
        id: uuid('id')
            .default(sql`gen_random_uuid()`)
            .primaryKey()
            .notNull(),
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

export const session = pgTable('session', {
    id: text('id').primaryKey().notNull(),
    userId: uuid('userId')
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

export const userSetting = pgTable(
    'user_setting',
    {
        userId: uuid('userId')
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

export const login = pgTable('login', {
    id: text('id').primaryKey().notNull(),
    method: LoginMethod('method'),
    userId: uuid('userId').references(() => user.id, {
        onDelete: 'set null',
        onUpdate: 'cascade'
    }),
    sessionId: text('sessionId').references(() => session.id, {
        onDelete: 'set null',
        onUpdate: 'cascade'
    }),
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

export const oauthAccount = pgTable('oauth_account', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull(),
    userId: uuid('userId')
        .notNull()
        .references(() => user.id, {
            onDelete: 'restrict',
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
            identifierTokenKey: uniqueIndex(
                'verification_token_identifier_token_key'
            ).on(table.identifier, table.token)
        };
    }
);

export const bank = pgTable('bank', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull(),
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

export const bankUploadAccounts = pgTable('bank_upload_accounts', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull(),
    type: TransactionAccountType('type').notNull(),
    bankId: uuid('bankId')
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

export const transactionAccount = pgTable(
    'transaction_account',
    {
        id: uuid('id')
            .default(sql`gen_random_uuid()`)
            .primaryKey()
            .notNull(),
        parentId: uuid('parentId').references(
            (): AnyPgColumn => transactionAccount.id
        ),
        userId: uuid('userId')
            .notNull()
            .references(() => user.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }),
        name: text('name').notNull(),
        description: text('description'),
        isLeaf: boolean('isLeaf').default(true).notNull(),
        type: TransactionAccountType('type').notNull(),
        bankId: uuid('bankId')
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
    }
    // (table) => {
    //     return {
    //         transactionAccountAccountParentIdFkey: foreignKey({
    //             columns: [table.accountParentId],
    //             foreignColumns: [table.id],
    //             name: 'transaction_account_accountParentId_fkey'
    //         })
    //             .onUpdate('cascade')
    //             .onDelete('set null')
    //     };
    // }
);

export const transactionImportFile = pgTable('import_file', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull(),
    userId: uuid('userId')
        .notNull()
        .references(() => user.id, {
            onDelete: 'restrict',
            onUpdate: 'cascade'
        }),
    url: text('url').notNull(),
    importId: uuid('importId').references(() => transactionImport.id, {
        onDelete: 'set null',
        onUpdate: 'cascade'
    }),
    filename: text('filename'),
    type: text('type').notNull(),
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
    ({ one }) => ({
        import: one(transactionImport, {
            fields: [transactionImportFile.importId],
            references: [transactionImport.id]
        })
    })
);

export const transactionImport = pgTable('import', {
    id: uuid('id')
        .default(sql`gen_random_uuid()`)
        .primaryKey()
        .notNull(),
    userId: uuid('userId')
        .notNull()
        .references(() => user.id, {
            onDelete: 'restrict',
            onUpdate: 'cascade'
        }),
    accountId: uuid('accountId')
        .notNull()
        .references(() => transactionAccount.id, {
            onDelete: 'restrict',
            onUpdate: 'cascade'
        }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
        .defaultNow()
        .notNull(),
    successAt: timestamp('successAt', { precision: 3, mode: 'date' }),
    countTransactions: integer('countTransactions')
});

export const transactionImportRelations = relations(
    transactionImport,
    ({ many }) => ({
        files: many(transactionImportFile)
    })
);

export const transaction = pgTable(
    'transaction',
    {
        id: uuid('id')
            .default(sql`gen_random_uuid()`)
            .primaryKey()
            .notNull(),
        userId: uuid('userId')
            .notNull()
            .references(() => user.id, {
                onDelete: 'restrict',
                onUpdate: 'cascade'
            }),
        accountId: uuid('accountId')
            .notNull()
            .references(() => transactionAccount.id, {
                onDelete: 'restrict',
                onUpdate: 'cascade'
            }),
        importId: uuid('importId')
            .notNull()
            .references(() => transactionImport.id, {
                onDelete: 'restrict',
                onUpdate: 'cascade'
            }),
        date: date('date').notNull(),
        title: text('title').notNull(),
        type: TransactionType('type').notNull(),
        spendingAmount: doublePrecision('spendingAmount').notNull(),
        spendingCurrency: char('spendingCurrency', { length: 3 }).notNull(),
        accountAmount: doublePrecision('accountAmount').notNull(),
        accountCurrency: char('accountCurrency', { length: 3 }).notNull(),
        createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' }),
        key: text('key').notNull(),
        note: text('note'),
        country: char('country', { length: 2 }),
        city: text('city'),
        labelId: uuid('labelId').references(() => label.id, {
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

export const label = pgTable(
    'label',
    {
        id: uuid('id')
            .default(sql`gen_random_uuid()`)
            .primaryKey()
            .notNull(),
        name: text('name').notNull(),
        userId: uuid('userId')
            .notNull()
            .references(() => user.id, {
                onDelete: 'restrict',
                onUpdate: 'cascade'
            }),
        description: text('description'),
        parentId: uuid('parentId').references((): AnyPgColumn => label.id),
        isLeaf: boolean('isLeaf').default(true).notNull(),
        createdAt: timestamp('createdAt', { precision: 3, mode: 'date' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updatedAt', {
            precision: 3,
            mode: 'date'
        })
    }
    // (table) => {
    //     return {
    //         labelLabelIdFkey: foreignKey({
    //             columns: [table.parentId],
    //             foreignColumns: [table.id]
    //         })
    //             .onUpdate('cascade')
    //             .onDelete('set null')
    //     };
    // }
);

export const transactionRelations = relations(transaction, ({ one }) => ({
    user: one(user, {
        fields: [transaction.userId],
        references: [user.id]
    }),
    // label: one(label, {
    //     fields: [transaction.labelId],
    //     references: [label.id]
    // }),
    import: one(transactionImport, {
        fields: [transaction.importId],
        references: [transactionImport.id]
    })
}));

// export const labelRelations = relations(label, ({ many }) => ({
//     transactions: many(transaction)
// }));
