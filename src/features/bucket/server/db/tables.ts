import { relations } from 'drizzle-orm';
import {
    boolean,
    decimal,
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';

import { participantToBucket } from '@/features/participant/server/db/tables';
import { transaction } from '@/features/transaction/server/db/tables';
import { user } from '@/lib/auth/server/db/tables';
import { createId } from '@paralleldrive/cuid2';

// ====================
// Enums
// ====================

export const bucketTypeEnum = pgEnum('bucket_type', ['trip', 'home', 'project', 'event', 'other']);
export const bucketStatusEnum = pgEnum('bucket_status', ['open', 'settled']);

// ====================
// Tables
// ====================

export const bucket = pgTable('bucket', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    type: bucketTypeEnum().notNull().default('other'),
    status: bucketStatusEnum().notNull().default('open'),

    // Tracking fields for bucket statistics
    totalTransactions: integer().notNull().default(0),
    openTransactions: integer().notNull().default(0),
    settledTransactions: integer().notNull().default(0),
    totalAmount: decimal({ precision: 12, scale: 2 }).notNull().default('0.00'),
    openAmount: decimal({ precision: 12, scale: 2 }).notNull().default('0.00'),
    settledAmount: decimal({ precision: 12, scale: 2 }).notNull().default('0.00'),

    // metadata
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    isActive: boolean().notNull().default(true),
});

export const bucketToTransaction = pgTable(
    'bucket_to_transaction',
    {
        id: text()
            .primaryKey()
            .$defaultFn(() => createId()),
        transactionId: text()
            .notNull()
            .references(() => transaction.id, { onDelete: 'cascade' }),
        bucketId: text()
            .notNull()
            .references(() => bucket.id, { onDelete: 'cascade' }),
        // Split value - unified naming with participant tables
        splitValue: decimal({ precision: 12, scale: 2 }).default('100.00'),
        // SplitWise integration status
        isRecorded: boolean().notNull().default(false),
        // Settlement status for each transaction
        isSettled: boolean().notNull().default(false),
        // Optional notes for this transaction-bucket relationship
        notes: text(),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        isActive: boolean().notNull().default(true),
    },
    (table) => [
        // Unique constraint: one transaction can only be in one bucket
        uniqueIndex('bucket_transaction_transaction_unique').on(
            table.transactionId,
            table.isActive
        ),
        // Index for bucket queries
        index('bucket_transaction_bucket_idx').on(table.bucketId),
        // Index for transaction queries
        index('bucket_transaction_transaction_idx').on(table.transactionId),
    ]
);

// ====================
// Relations
// ====================

export const bucketRelations = relations(bucket, ({ many, one }) => ({
    user: one(user, {
        fields: [bucket.userId],
        references: [user.id],
    }),
    transactions: many(bucketToTransaction),
    participants: many(participantToBucket),
}));

export const bucketTransactionRelations = relations(bucketToTransaction, ({ one }) => ({
    transaction: one(transaction, {
        fields: [bucketToTransaction.transactionId],
        references: [transaction.id],
    }),
    bucket: one(bucket, {
        fields: [bucketToTransaction.bucketId],
        references: [bucket.id],
    }),
}));
