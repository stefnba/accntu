import { user } from '@/server/db/tables';
import { createId } from '@paralleldrive/cuid2';
import { InferSelectModel } from 'drizzle-orm';
import { boolean, PgTable, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Common table fields
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

// ================================
// Types
// ================================

export type CommonTableFieldKeys = keyof typeof COMMON_FIELDS;

export type CommonTable = PgTable;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = pgTable('common_table', COMMON_FIELDS);
export type CommonTableField = InferSelectModel<typeof _>;

// ================================
// Utility functions
// ================================

export function commonTableFields<K extends keyof typeof COMMON_FIELDS>(options: {
    exclude: K[];
}): Omit<typeof COMMON_FIELDS, K>;

export function commonTableFields<K extends keyof typeof COMMON_FIELDS>(options: {
    include: K[];
}): Pick<typeof COMMON_FIELDS, K>;

export function commonTableFields(): typeof COMMON_FIELDS;

/**
 * Common table fields
 */
export function commonTableFields<K extends keyof typeof COMMON_FIELDS>(
    options: {
        exclude?: K[];
        include?: K[];
    } = {}
) {
    const { exclude, include } = options;

    // If include is specified, return only those fields
    if (include && include.length > 0) {
        const result = {} as Partial<typeof COMMON_FIELDS>;
        include.forEach((key) => {
            result[key] = COMMON_FIELDS[key];
        });
        return result;
    }

    // If exclude is specified, return all fields except those
    if (exclude && exclude.length > 0) {
        const result = { ...COMMON_FIELDS };
        for (const key of exclude) {
            delete result[key];
        }
        return result;
    }

    // No options provided, return all fields
    return COMMON_FIELDS;
}
