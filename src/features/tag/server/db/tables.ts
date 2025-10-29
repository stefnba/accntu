import { transaction } from '@/features/transaction/server/db/tables';
import { createSystemTableFields } from '@/server/lib/db/table';
import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, text, uniqueIndex } from 'drizzle-orm/pg-core';

// ====================
// Tables
// ====================
export const tag = pgTable(
    'tag',
    {
        ...createSystemTableFields(),
        name: text().notNull(),
        description: text(),
        color: text().notNull().default('#6366f1'), // Hex color for UI
        transactionCount: integer().default(0),
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
        ...createSystemTableFields({ include: ['createdAt', 'updatedAt'] }),
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
