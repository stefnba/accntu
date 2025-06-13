import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export const user = pgTable('user', {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp().notNull(),
    role: text(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp(),
    lastLoginAt: timestamp(),
    lastName: text(),
});

export const authSession = pgTable('auth_session', {
    id: text().primaryKey(),
    expiresAt: timestamp().notNull(),
    token: text().notNull().unique(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp().notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text(),
    lastActiveAt: timestamp(),
});

export const authAccount = pgTable('auth_account', {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp(),
    refreshTokenExpiresAt: timestamp(),
    scope: text(),
    password: text(),
    createdAt: timestamp().notNull(),
    updatedAt: timestamp().notNull(),
});

export const authVerification = pgTable('auth_verification', {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp().notNull(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
});

export const authPasskey = pgTable('auth_passkey', {
    id: text().primaryKey(),
    name: text(),
    publicKey: text().notNull(),
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    credentialID: text().notNull(),
    counter: integer().notNull(),
    deviceType: text().notNull(),
    backedUp: boolean().notNull(),
    transports: text(),
    createdAt: timestamp(),
});

// // Schemas for type safety
export const SelectSessionSchema = createSelectSchema(authSession);
export const InsertSessionSchema = createInsertSchema(authSession).pick({
    userId: true,
    expiresAt: true,
    ipAddress: true,
    userAgent: true,
});
export const UpdateSessionSchema = InsertSessionSchema;

export const SelectAuthAccountSchema = createSelectSchema(authAccount);
export const InsertAuthAccountSchema = createInsertSchema(authAccount);
export const UpdateAuthAccountSchema = createUpdateSchema(authAccount);

export const SelectAuthVerificationSchema = createSelectSchema(authVerification);
export const InsertAuthVerificationSchema = createInsertSchema(authVerification);
export const UpdateAuthVerificationSchema = createUpdateSchema(authVerification);

export const SelectAuthPasskeySchema = createSelectSchema(authPasskey);
export const InsertAuthPasskeySchema = createInsertSchema(authPasskey);

export const SelectUserSchema = createSelectSchema(user);
export const InsertUserSchema = createInsertSchema(user);
export const UpdateUserSchema = createUpdateSchema(user).pick({
    name: true,
    lastName: true,
    image: true,
});
