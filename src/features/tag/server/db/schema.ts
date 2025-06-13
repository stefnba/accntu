import { transaction } from '@/features/transaction/server/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import {
    AnyPgColumn,
    boolean,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';

export const tagTypeEnum = pgEnum('tag_type', [
    'category',
    'merchant',
    'project',
    'location',
    'custom',
]);

// Flexible tags for user-defined categorization
export const tag = pgTable(
    'tag',
    {
        id: text()
            .primaryKey()
            .notNull()
            .$defaultFn(() => createId()),
        userId: text().notNull(), // Tags are user-specific

        name: text().notNull(),
        description: text(),
        color: text().notNull().default('#6366f1'), // Hex color for UI
        icon: text(), // Icon name/identifier
        type: tagTypeEnum().notNull().default('custom'),

        // Hierarchy support (optional parent tag)
        parentTagId: text(),

        // Auto-tagging rules
        autoTagRules: text().array(), // Array of regex patterns or keywords

        transactionCount: integer().default(0),
        isActive: boolean().notNull().default(true),
        createdAt: timestamp().notNull().defaultNow(),
        updatedAt: timestamp().notNull().defaultNow(),
    },
    (table) => [uniqueIndex('tag_user_name_unique').on(table.userId, table.name)]
);

// Hierarchical labels for structured categorization (like expense categories)
export const label = pgTable('label', {
    id: text()
        .primaryKey()
        .notNull()
        .$defaultFn(() => createId()),
    userId: text().notNull(),

    name: text().notNull(),
    description: text(),
    color: text(),

    // Hierarchy management
    rank: integer().default(0).notNull(), // Sort order within same level
    level: integer().default(0).notNull(), // Depth in hierarchy
    parentId: text().references((): AnyPgColumn => label.id),
    firstParentId: text().references((): AnyPgColumn => label.id), // Root parent

    isDeleted: boolean().notNull().default(false),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

// Junction table for many-to-many relationship between transactions and tags
export const transactionTag = pgTable(
    'transaction_tag',
    {
        transactionId: text()
            .notNull()
            .references(() => transaction.id, { onDelete: 'cascade' }),
        tagId: text()
            .notNull()
            .references(() => tag.id, { onDelete: 'cascade' }),

        // Metadata for the relationship
        confidence: text(), // For auto-tagged: 'high', 'medium', 'low'
        source: text().notNull().default('manual'), // 'manual', 'auto', 'imported'

        createdAt: timestamp().notNull().defaultNow(),
    },
    (table) => [primaryKey({ columns: [table.transactionId, table.tagId] })]
);

// Relations
export const tagRelations = relations(tag, ({ one, many }) => ({
    parentTag: one(tag, {
        fields: [tag.parentTagId],
        references: [tag.id],
    }),
    childTags: many(tag),
    transactionTags: many(transactionTag),
}));

export const labelRelations = relations(label, ({ one, many }) => ({
    parentLabel: one(label, {
        fields: [label.parentId],
        references: [label.id],
    }),
    childLabels: many(label),
    transactions: many(transaction), // Direct label assignment to transactions
}));

export const transactionTagRelations = relations(transactionTag, ({ one }) => ({
    transaction: one(transaction, {
        fields: [transactionTag.transactionId],
        references: [transaction.id],
    }),
    tag: one(tag, {
        fields: [transactionTag.tagId],
        references: [tag.id],
    }),
}));

export type Tag = typeof tag.$inferSelect;
export type NewTag = typeof tag.$inferInsert;
export type Label = typeof label.$inferSelect;
export type NewLabel = typeof label.$inferInsert;
export type TransactionTag = typeof transactionTag.$inferSelect;
export type NewTransactionTag = typeof transactionTag.$inferInsert;
