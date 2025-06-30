import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    role: text('role').notNull().default('user'),
    banned: boolean('banned'),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    lastLoginAt: timestamp('last_login_at'),
    lastName: text('last_name'),
});

export const authSession = pgTable('auth_session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
    lastActiveAt: timestamp('last_active_at'),
});

export const authAccount = pgTable('auth_account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
});

export const authVerification = pgTable('auth_verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
});

export const authPasskey = pgTable('auth_passkey', {
    id: text('id').primaryKey(),
    name: text('name'),
    publicKey: text('public_key').notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    credentialID: text('credential_i_d').notNull(),
    counter: integer('counter').notNull(),
    deviceType: text('device_type').notNull(),
    backedUp: boolean('backed_up').notNull(),
    transports: text('transports'),
    createdAt: timestamp('created_at'),
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
