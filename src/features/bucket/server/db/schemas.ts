import { relations } from 'drizzle-orm';
import {
    boolean,
    decimal,
    index,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

import { transaction } from '@/features/transaction/server/db/schema';
import { user } from '@/lib/auth/server/db/schema';
import { createId } from '@paralleldrive/cuid2';

// ====================
// Enums
// ====================

export const bucketTypeEnum = pgEnum('bucket_type', ['trip', 'home', 'project', 'event', 'other']);
export const bucketStatusEnum = pgEnum('bucket_status', ['open', 'settled']);

// ====================
// Tables
// ====================

export const bucketParticipant = pgTable('bucket_participant', {
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

export const bucketToBucketParticipant = pgTable(
    'bucket_to_bucket_participant',
    {
        bucketId: text()
            .notNull()
            .references(() => bucket.id, { onDelete: 'cascade' }),
        participantId: text()
            .notNull()
            .references(() => bucketParticipant.id, { onDelete: 'cascade' }),
        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp().notNull().defaultNow(),
    },
    (table) => [primaryKey({ columns: [table.bucketId, table.participantId] })]
);

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
        // Split share - for future use when we might support splitting
        splitShare: decimal({ precision: 12, scale: 2 }).default('100.00'),
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

export const bucketTransactionParticipant = pgTable(
    'bucket_transaction_participant',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        bucketTransactionId: text('bucket_transaction_id')
            .notNull()
            .references(() => bucketToTransaction.id, { onDelete: 'cascade' }),
        participantId: text('participant_id')
            .notNull()
            .references(() => bucketParticipant.id, { onDelete: 'cascade' }),
        share: decimal('share', { precision: 12, scale: 2 }).notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => ({
        bucketTransactionIdx: index('btp_bucket_transaction_idx').on(table.bucketTransactionId),
        participantIdx: index('btp_participant_idx').on(table.participantId),
    })
);

// ====================
// Relations
// ====================

export const bucketParticipantRelations = relations(bucketParticipant, ({ one, many }) => ({
    user: one(user, {
        fields: [bucketParticipant.userId],
        references: [user.id],
        relationName: 'creator',
    }),
    linkedUser: one(user, {
        fields: [bucketParticipant.linkedUserId],
        references: [user.id],
        relationName: 'linked_user',
    }),
    bucketParticipants: many(bucketToBucketParticipant),
    bucketTransactionParticipants: many(bucketTransactionParticipant),
}));

export const bucketRelations = relations(bucket, ({ many, one }) => ({
    user: one(user, {
        fields: [bucket.userId],
        references: [user.id],
    }),
    participants: many(bucketToBucketParticipant),
    transactions: many(bucketToTransaction),
}));

export const bucketToBucketParticipantRelations = relations(
    bucketToBucketParticipant,
    ({ one }) => ({
        bucket: one(bucket, {
            fields: [bucketToBucketParticipant.bucketId],
            references: [bucket.id],
        }),
        participant: one(bucketParticipant, {
            fields: [bucketToBucketParticipant.participantId],
            references: [bucketParticipant.id],
        }),
    })
);

export const bucketTransactionRelations = relations(bucketToTransaction, ({ one, many }) => ({
    transaction: one(transaction, {
        fields: [bucketToTransaction.transactionId],
        references: [transaction.id],
    }),
    bucket: one(bucket, {
        fields: [bucketToTransaction.bucketId],
        references: [bucket.id],
    }),
    participants: many(bucketTransactionParticipant),
}));

export const bucketTransactionParticipantRelations = relations(
    bucketTransactionParticipant,
    ({ one }) => ({
        bucketTransaction: one(bucketToTransaction, {
            fields: [bucketTransactionParticipant.bucketTransactionId],
            references: [bucketToTransaction.id],
        }),
        bucketParticipant: one(bucketParticipant, {
            fields: [bucketTransactionParticipant.participantId],
            references: [bucketParticipant.id],
        }),
    })
);

// ====================
// Base Zod schemas
// ====================

// bucket
export const selectBucketSchema = createSelectSchema(bucket);
export const insertBucketSchema = createInsertSchema(bucket);
export const updateBucketSchema = createUpdateSchema(bucket);

// bucket participant
export const selectBucketParticipantSchema = createSelectSchema(bucketParticipant);
export const insertBucketParticipantSchema = createInsertSchema(bucketParticipant);
export const updateBucketParticipantSchema = createUpdateSchema(bucketParticipant);

// bucket to bucket participant
export const selectBucketToBucketParticipantSchema = createSelectSchema(bucketToBucketParticipant);
export const insertBucketToBucketParticipantSchema = createInsertSchema(bucketToBucketParticipant);
export const updateBucketToBucketParticipantSchema = createUpdateSchema(bucketToBucketParticipant);

// bucket to transaction
export const selectBucketToTransactionSchema = createSelectSchema(bucketToTransaction);
export const insertBucketToTransactionSchema = createInsertSchema(bucketToTransaction);
export const updateBucketToTransactionSchema = createUpdateSchema(bucketToTransaction);

// bucket transaction participant
export const selectBucketTransactionParticipantSchema = createSelectSchema(
    bucketTransactionParticipant
);
export const insertBucketTransactionParticipantSchema = createInsertSchema(
    bucketTransactionParticipant
);
export const updateBucketTransactionParticipantSchema = createUpdateSchema(
    bucketTransactionParticipant
);
