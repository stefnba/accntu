import { user } from '@/features/user/server/db/schema';
import { integer, pgEnum, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

// Provider enum for auth providers
const oauthProviderOptions = ['github', 'google', 'apple'] as const;
export const OAuthProviderSchema = z.enum(oauthProviderOptions);
export type TOAuthProvider = z.infer<typeof OAuthProviderSchema>;

const authProviderOptions = ['email', ...oauthProviderOptions] as const;
export const authProviderDrizzle = pgEnum('auth_provider', authProviderOptions);
export const AuthProviderSchema = z.enum(authProviderOptions);
export type TAuthProvider = z.infer<typeof AuthProviderSchema>;

// OTP types
const optTypeOptions = ['login', 'magic-link', 'email-verification'] as const;
export const optTypeDrizzle = pgEnum('opt_type', optTypeOptions);
export const OptTypeSchema = z.enum(optTypeOptions);
export type TOptType = z.infer<typeof OptTypeSchema>;

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
        provider: authProviderDrizzle().notNull(),
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
export const verificationToken = pgTable(
    'verification_token',
    {
        token: text().notNull(),
        userId: text().references(() => user.id, { onDelete: 'cascade' }),
        email: text(),
        type: optTypeDrizzle().notNull(),
        expiresAt: timestamp({ mode: 'date' }).notNull(),
        createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
        usedAt: timestamp({ mode: 'date' }),
        attempts: integer().notNull().default(0),
        hashedCode: text().notNull(), //  hashed OTP
    },
    (table) => {
        return {
            // Use token as primary key since it should be unique
            pk: primaryKey({ columns: [table.token] }),
        };
    }
);

// Schemas for type safety
export const SelectSessionSchema = createSelectSchema(session);
export const InsertSessionSchema = createInsertSchema(session).pick({
    userId: true,
    expiresAt: true,
    ipAddress: true,
    userAgent: true,
});

export const SelectAccountSchema = createSelectSchema(authAccount);
export const InsertAccountSchema = createInsertSchema(authAccount);

export const SelectVerificationTokenSchema = createSelectSchema(verificationToken);
export const InsertVerificationTokenSchema = createInsertSchema(verificationToken).omit({
    token: true,
    attempts: true,
    usedAt: true,
    createdAt: true,
});
export const UpdateVerificationTokenSchema = createUpdateSchema(verificationToken).omit({});

// Types
export type TSession = z.infer<typeof SelectSessionSchema>;
export type TSessionCreate = z.infer<typeof InsertSessionSchema>;

export type TAccount = z.infer<typeof SelectAccountSchema>;
export type TAccountCreate = z.infer<typeof InsertAccountSchema>;

export type TVerificationToken = z.infer<typeof SelectVerificationTokenSchema>;
export type TVerificationTokenCreate = z.infer<typeof InsertVerificationTokenSchema>;
