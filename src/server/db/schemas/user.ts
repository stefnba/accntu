import { boolean, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
export const userRole = pgEnum('user_role', ['admin', 'user']);
export const userTheme = pgEnum('user_theme', ['light', 'dark', 'system']);
export const userLanguage = pgEnum('user_language', ['en']);

export const user = pgTable('user', {
    id: text().primaryKey(),
    firstName: varchar({ length: 255 }),
    lastName: varchar({ length: 255 }),
    image: text(),
    email: varchar({ length: 255 }).notNull().unique(),
    emailVerifiedAt: timestamp({ mode: 'date' }),
    createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date' }),
    isEnabled: boolean().notNull().default(true),
    lastLoginAt: timestamp({ mode: 'date' }),
    role: userRole().notNull().default('user'),
});
export const SelectUserSchema = createSelectSchema(user);
export const InsertUserSchema = createInsertSchema(user);

export const userSettings = pgTable('user_settings', {
    userId: text()
        .primaryKey()
        .references(() => user.id),
    theme: userTheme().notNull().default('system'),
    currency: text(),
    language: userLanguage().notNull().default('en'),
    timezone: text(),
});
export const SelectUserSettingsSchema = createSelectSchema(userSettings);
export const InsertUserSettingsSchema = createInsertSchema(userSettings);
