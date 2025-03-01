import { pgEnum, pgTable, primaryKey, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from './user';

// Provider enum for social logins
export const authProvider = pgEnum('auth_provider', ['email', 'github', 'google']);
export const optType = pgEnum('opt_type', ['login', 'magic-link', 'email-verification']);

// Create Zod enums for type safety
export const OptTypeEnum = z.enum(['login', 'magic-link', 'email-verification']);
export type OptType = z.infer<typeof OptTypeEnum>;

// Session table for storing user sessions
export const session = pgTable('session', {
    id: text().primaryKey(),
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    expiresAt: timestamp({ mode: 'date' }).notNull(),
    createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date' }),
    ipAddress: text(),
    userAgent: text(),
    lastActiveAt: timestamp({ mode: 'date' }),
});

export const authAccount = pgTable(
    'auth_account',
    {
        userId: text()
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        provider: authProvider().notNull(),
        providerAccountId: text().notNull(),
        refreshToken: text(),
        accessToken: text(),
        expiresAt: timestamp({ mode: 'date' }),
        createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
        updatedAt: timestamp({ mode: 'date' }),
    },
    (table) => {
        return {
            // Ensure each user can only have one account per provider
            providerUserIdIdx: primaryKey({ columns: [table.userId, table.provider] }),
        };
    }
);

// Verification token table for OTP and email verification
export const verificationToken = pgTable('verification_token', {
    id: text().primaryKey(),
    token: varchar({ length: 6 }).notNull(),
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    type: optType().notNull(),
    expiresAt: timestamp({ mode: 'date' }).notNull(),
    createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
    usedAt: timestamp({ mode: 'date' }),
});

// Schemas for type safety
export const SelectSessionSchema = createSelectSchema(session);
export const InsertSessionSchema = createInsertSchema(session);

export const SelectAccountSchema = createSelectSchema(authAccount);
export const InsertAccountSchema = createInsertSchema(authAccount);

export const SelectVerificationTokenSchema = createSelectSchema(verificationToken);
export const InsertVerificationTokenSchema = createInsertSchema(verificationToken);

// Types
export type TSession = z.infer<typeof SelectSessionSchema>;
export type TSessionCreate = z.infer<typeof InsertSessionSchema>;

export type TAccount = z.infer<typeof SelectAccountSchema>;
export type TAccountCreate = z.infer<typeof InsertAccountSchema>;

export type TVerificationToken = z.infer<typeof SelectVerificationTokenSchema>;
export type TVerificationTokenCreate = z.infer<typeof InsertVerificationTokenSchema>;
