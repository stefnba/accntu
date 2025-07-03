import { relations } from 'drizzle-orm';
import {
    boolean,
    decimal,
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { transaction } from '@/features/transaction/server/db/schema';
import { user } from '@/lib/auth/server/db/schema';
import { createId } from '@paralleldrive/cuid2';

export const bucketTypeEnum = pgEnum('bucket_type', ['trip', 'home', 'project', 'event', 'other']);

export const bucketStatusEnum = pgEnum('bucket_status', ['open', 'settled']);

export const bucket = pgTable('bucket', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    type: bucketTypeEnum('type').notNull().default('other'),
    status: bucketStatusEnum('status').notNull().default('open'),
    // Tracking fields for bucket statistics
    paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).notNull().default('0.00'),
    currency: text('currency').notNull().default('USD'),
    // Computed fields (totalTransactions, totalAmount, openAmount) will be calculated in queries
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean('is_active').notNull().default(true),
});

export const bucketParticipant = pgTable('bucket_participant', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    bucketId: text('bucket_id')
        .notNull()
        .references(() => bucket.id, { onDelete: 'cascade' }),
    // If the participant is an existing user of the app
    userId: text('user_id').references(() => user.id, {
        onDelete: 'set null',
    }),
    // Name for external participants not on the app
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    isActive: boolean('is_active').notNull().default(true),
});

export const bucketTransaction = pgTable(
    'bucket_transaction',
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
        // Optional notes for this transaction-bucket relationship
        notes: text(),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
        isActive: boolean().notNull().default(true),
    },
    (table) => ({
        // Unique constraint: one transaction can only be in one bucket
        transactionUniqueIdx: uniqueIndex('bucket_transaction_transaction_unique').on(
            table.transactionId,
            table.isActive
        ),
        // Index for bucket queries
        bucketIdx: index('bucket_transaction_bucket_idx').on(table.bucketId),
        // Index for transaction queries
        transactionIdx: index('bucket_transaction_transaction_idx').on(table.transactionId),
    })
);

export const bucketsRelations = relations(bucket, ({ many, one }) => ({
    user: one(user, {
        fields: [bucket.userId],
        references: [user.id],
    }),
    participants: many(bucketParticipant),
    bucketTransactions: many(bucketTransaction),
}));

export const bucketParticipantsRelations = relations(bucketParticipant, ({ one }) => ({
    bucket: one(bucket, {
        fields: [bucketParticipant.bucketId],
        references: [bucket.id],
    }),
    user: one(user, {
        fields: [bucketParticipant.userId],
        references: [user.id],
    }),
}));

export const bucketTransactionRelations = relations(bucketTransaction, ({ one }) => ({
    transaction: one(transaction, {
        fields: [bucketTransaction.transactionId],
        references: [transaction.id],
    }),
    bucket: one(bucket, {
        fields: [bucketTransaction.bucketId],
        references: [bucket.id],
    }),
}));

// Zod schemas
export const selectBucketSchema = createSelectSchema(bucket);
export const insertBucketSchema = createInsertSchema(bucket, {
    title: z.string().min(1, 'Title is required'),
    paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
}).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    isActive: true,
});
export const updateBucketSchema = insertBucketSchema.partial();

export const selectBucketParticipantSchema = createSelectSchema(bucketParticipant);
export const insertBucketParticipantSchema = createInsertSchema(bucketParticipant, {
    name: z.string().min(1, 'Name is required'),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isActive: true,
});
export const updateBucketParticipantSchema = insertBucketParticipantSchema.partial();

export const selectbucketTransactionSchema = createSelectSchema(bucketTransaction);
export const insertbucketTransactionSchema = createInsertSchema(bucketTransaction, {
    transactionId: z.string().min(1, 'Transaction ID is required'),
    bucketId: z.string().min(1, 'Bucket ID is required'),
    splitShare: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Invalid split share format')
        .optional(),
    notes: z.string().optional(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isActive: true,
});
export const updatebucketTransactionSchema = insertbucketTransactionSchema.partial();
