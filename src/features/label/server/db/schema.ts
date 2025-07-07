import { user } from '@/lib/auth/server/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { boolean, PgColumn, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export const label = pgTable('label', {
    id: text()
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    color: text(),
    icon: text(),
    imageUrl: text(),
    parentId: text().references((): PgColumn => label.id, { onDelete: 'cascade' }),
    firstParentId: text().references((): PgColumn => label.id, { onDelete: 'cascade' }),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const labelsRelations = relations(label, ({ one, many }) => ({
    user: one(user, {
        fields: [label.userId],
        references: [user.id],
    }),
    parent: one(label, {
        fields: [label.parentId],
        references: [label.id],
        relationName: 'labelHierarchy',
    }),
    firstParent: one(label, {
        fields: [label.firstParentId],
        references: [label.id],
    }),
    children: many(label, {
        relationName: 'labelHierarchy',
    }),
}));

export const selectLabelSchema = createSelectSchema(label);
export const insertLabelSchema = createInsertSchema(label);
export const updateLabelSchema = createUpdateSchema(label);
