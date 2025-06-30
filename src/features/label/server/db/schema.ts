import { transaction } from '@/features/transaction/server/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { AnyPgColumn, boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

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

// Relations
export const labelRelations = relations(label, ({ one, many }) => ({
    parentLabel: one(label, {
        fields: [label.parentId],
        references: [label.id],
    }),
    childLabels: many(label),
    transactions: many(transaction), // Direct label assignment to transactions
}));

export type Label = typeof label.$inferSelect;
export type NewLabel = typeof label.$inferInsert;
