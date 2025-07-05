import { transaction } from '@/features/transaction/server/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import {
    boolean,
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

// ====================
// Tables
// ====================
export const tag = pgTable(
    'tag',
    {
        id: text()
            .primaryKey()
            .notNull()
            .$defaultFn(() => createId()),
        userId: text().notNull(),

        name: text().notNull(),
        description: text(),
        color: text().notNull().default('#6366f1'), // Hex color for UI

        transactionCount: integer().default(0),
        isActive: boolean().notNull().default(true),
        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp().notNull().defaultNow(),
    },
    (table) => [uniqueIndex('tag_user_name_unique').on(table.userId, table.name)]
);

export const tagToTransaction = pgTable(
    'tag_to_transaction',
    {
        transactionId: text()
            .notNull()
            .references(() => transaction.id, { onDelete: 'cascade' }),
        tagId: text()
            .notNull()
            .references(() => tag.id, { onDelete: 'cascade' }),

        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp().notNull().defaultNow(),
    },
    (table) => [primaryKey({ columns: [table.transactionId, table.tagId] })]
);

// ====================
// Relations
// ====================
export const tagRelations = relations(tag, ({ many }) => ({
    transactionTags: many(tagToTransaction),
}));

export const transactionTagRelations = relations(tagToTransaction, ({ one }) => ({
    transaction: one(transaction, {
        fields: [tagToTransaction.transactionId],
        references: [transaction.id],
    }),
    tag: one(tag, {
        fields: [tagToTransaction.tagId],
        references: [tag.id],
    }),
}));

// ====================
// Base Zod schemas
// ====================

// tag
export const selectTagSchema = createSelectSchema(tag);
export const insertTagSchema = createInsertSchema(tag);
export const updateTagSchema = createUpdateSchema(tag);

// transaction to tag
export const selectTransactionToTagSchema = createSelectSchema(tagToTransaction);
export const insertTransactionToTagSchema = createInsertSchema(tagToTransaction);
