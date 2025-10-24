import { user } from '@/lib/auth/server/db/tables';
import { createId } from '@paralleldrive/cuid2';
import { boolean, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Common table fields for our tables
 * @example
 * ```typescript
 * const tag = pgTable('tag', {
 *     ...createCommonTableFields(),
 *     name: text().notNull(),
 * });
 * ```
 */
export const COMMON_FIELDS = {
    id: text()
        .primaryKey()
        .notNull()
        .$defaultFn(() => createId()),
    // use references to user table
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
} as const;
