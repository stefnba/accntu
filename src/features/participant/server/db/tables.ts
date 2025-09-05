import { relations } from 'drizzle-orm';
import { boolean, index, integer, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { connectedBankAccount } from '@/features/bank/server/db/tables';
import { bucket } from '@/features/bucket/server/db/tables';
import { transaction } from '@/features/transaction/server/db/tables';
import { user } from '@/lib/auth/server/db/tables';
import { createId } from '@paralleldrive/cuid2';

// ====================
// Tables
// ====================

export const participant = pgTable('participant', {
    id: text()
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    email: text(),
    linkedUserId: text().references(() => user.id, {
        onDelete: 'set null',
    }),
    totalTransactions: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    isActive: boolean().notNull().default(true),
});

export const participantToTransaction = pgTable(
    'participant_to_transaction',
    {
        id: text()
            .primaryKey()
            .$defaultFn(() => createId()),
        participantId: text()
            .notNull()
            .references(() => participant.id, { onDelete: 'cascade' }),
        transactionId: text()
            .notNull()
            .references(() => transaction.id, { onDelete: 'cascade' }),
        splitConfig: json().notNull().default('{"type":"equal"}'),
        notes: text(),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        isActive: boolean().notNull().default(true),
    },
    (table) => [
        index('participant_transaction_participant_idx').on(table.participantId),
        index('participant_transaction_transaction_idx').on(table.transactionId),
    ]
);

export const participantToConnectedBankAccount = pgTable(
    'participant_to_connected_bank_account',
    {
        id: text()
            .primaryKey()
            .$defaultFn(() => createId()),
        participantId: text()
            .notNull()
            .references(() => participant.id, { onDelete: 'cascade' }),
        connectedBankAccountId: text()
            .notNull()
            .references(() => connectedBankAccount.id, { onDelete: 'cascade' }),
        splitConfig: json().notNull().default('{"type":"equal"}'),
        notes: text(),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        isActive: boolean().notNull().default(true),
    },
    (table) => [
        index('participant_bank_account_participant_idx').on(table.participantId),
        index('participant_bank_account_account_idx').on(table.connectedBankAccountId),
    ]
);

export const participantToBucket = pgTable(
    'participant_to_bucket',
    {
        id: text()
            .primaryKey()
            .$defaultFn(() => createId()),
        participantId: text()
            .notNull()
            .references(() => participant.id, { onDelete: 'cascade' }),
        bucketId: text()
            .notNull()
            .references(() => bucket.id, { onDelete: 'cascade' }),
        splitConfig: json().notNull().default('{"type":"equal"}'),
        notes: text(),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        isActive: boolean().notNull().default(true),
    },
    (table) => [
        index('participant_bucket_participant_idx').on(table.participantId),
        index('participant_bucket_bucket_idx').on(table.bucketId),
    ]
);

// ====================
// Relations
// ====================

export const participantRelations = relations(participant, ({ one, many }) => ({
    user: one(user, {
        fields: [participant.userId],
        references: [user.id],
        relationName: 'creator',
    }),
    linkedUser: one(user, {
        fields: [participant.linkedUserId],
        references: [user.id],
        relationName: 'linked_user',
    }),
    transactions: many(participantToTransaction),
    connectedBankAccounts: many(participantToConnectedBankAccount),
    buckets: many(participantToBucket),
}));

export const participantToTransactionRelations = relations(participantToTransaction, ({ one }) => ({
    participant: one(participant, {
        fields: [participantToTransaction.participantId],
        references: [participant.id],
    }),
    transaction: one(transaction, {
        fields: [participantToTransaction.transactionId],
        references: [transaction.id],
    }),
}));

export const participantToConnectedBankAccountRelations = relations(
    participantToConnectedBankAccount,
    ({ one }) => ({
        participant: one(participant, {
            fields: [participantToConnectedBankAccount.participantId],
            references: [participant.id],
        }),
        connectedBankAccount: one(connectedBankAccount, {
            fields: [participantToConnectedBankAccount.connectedBankAccountId],
            references: [connectedBankAccount.id],
        }),
    })
);

export const participantToBucketRelations = relations(participantToBucket, ({ one }) => ({
    participant: one(participant, {
        fields: [participantToBucket.participantId],
        references: [participant.id],
    }),
    bucket: one(bucket, {
        fields: [participantToBucket.bucketId],
        references: [bucket.id],
    }),
}));
