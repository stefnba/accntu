import { user } from '@/lib/auth/server/db/tables';
import { typedKeys } from '@/lib/utils';
import { createId } from '@paralleldrive/cuid2';
import { boolean, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * System table fields for our tables. These are system-managed fields included in all tables.
 * These fields are:
 * - id: The primary key of the table
 * - userId: The user id of the table
 * - isActive: The active status of the table (soft delete)
 * - createdAt: The creation timestamp of the table
 * - updatedAt: The last update timestamp of the table
 *
 * **Important:** These fields are typically system-managed and should NOT be included in
 * `allowedUpsertColumns` for create/update operations.
 *
 * @example
 * ```typescript
 * const tag = pgTable('tag', {
 *     ...createSystemTableFields(),
 *     name: text().notNull(),
 * });
 * ```
 */
export const SYSTEM_FIELDS = {
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

export const SYSTEM_FIELDS_KEYS = typedKeys(SYSTEM_FIELDS);
