import {
    boolean,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export const user = pgTable(
    'user',
    {
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
        settings: text('settings'), // JSON string for user preferences
    },
    (table) => [
        // Security indexes for user lookups and admin operations
        uniqueIndex('user_email_idx').on(table.email),
        index('user_role_idx').on(table.role),
        index('user_banned_idx').on(table.banned),
        index('user_last_login_idx').on(table.lastLoginAt),
        // Composite index for active user lookups
        index('user_email_banned_idx').on(table.email, table.banned),
    ]
);

export const authSession = pgTable(
    'auth_session',
    {
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
    },
    (table) => [
        // Critical security indexes for session management
        uniqueIndex('auth_session_token_idx').on(table.token),
        index('auth_session_user_id_idx').on(table.userId),
        index('auth_session_expires_at_idx').on(table.expiresAt),
        // Composite index for session cleanup operations
        index('auth_session_user_expires_idx').on(table.userId, table.expiresAt),
        // Security monitoring indexes
        index('auth_session_ip_address_idx').on(table.ipAddress),
        index('auth_session_last_active_idx').on(table.lastActiveAt),
        // Admin impersonation tracking
        index('auth_session_impersonated_idx').on(table.impersonatedBy),
    ]
);

export const authAccount = pgTable(
    'auth_account',
    {
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
    },
    (table) => [
        // OAuth account security indexes
        index('auth_account_user_id_idx').on(table.userId),
        index('auth_account_provider_idx').on(table.providerId),
        // Composite index for OAuth account lookups
        index('auth_account_user_provider_idx').on(table.userId, table.providerId),
        index('auth_account_account_provider_idx').on(table.accountId, table.providerId),
        // Token expiration indexes for cleanup
        index('auth_account_access_expires_idx').on(table.accessTokenExpiresAt),
        index('auth_account_refresh_expires_idx').on(table.refreshTokenExpiresAt),
    ]
);

export const authVerification = pgTable(
    'auth_verification',
    {
        id: text('id').primaryKey(),
        identifier: text('identifier').notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        createdAt: timestamp('created_at'),
        updatedAt: timestamp('updated_at'),
    },
    (table) => [
        // Verification token security indexes
        index('auth_verification_identifier_idx').on(table.identifier),
        index('auth_verification_expires_at_idx').on(table.expiresAt),
        // Composite index for verification lookups
        index('auth_verification_identifier_value_idx').on(table.identifier, table.value),
    ]
);

export const authPasskey = pgTable(
    'auth_passkey',
    {
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
    },
    (table) => [
        // Passkey security indexes
        index('auth_passkey_user_id_idx').on(table.userId),
        uniqueIndex('auth_passkey_credential_id_idx').on(table.credentialID),
        index('auth_passkey_device_type_idx').on(table.deviceType),
        // Composite index for user passkey lookups
        index('auth_passkey_user_created_idx').on(table.userId, table.createdAt),
    ]
);

// ===============================
// Base Zod Schemas
// ===============================

// Session schemas
export const selectSessionSchema = createSelectSchema(authSession);
export const insertSessionSchema = createInsertSchema(authSession);
export const updateSessionSchema = createUpdateSchema(authSession);

// Auth account schemas
export const selectAuthAccountSchema = createSelectSchema(authAccount);
export const insertAuthAccountSchema = createInsertSchema(authAccount);
export const updateAuthAccountSchema = createUpdateSchema(authAccount);

// Auth verification schemas
export const selectAuthVerificationSchema = createSelectSchema(authVerification);
export const insertAuthVerificationSchema = createInsertSchema(authVerification);
export const updateAuthVerificationSchema = createUpdateSchema(authVerification);

// Auth passkey schemas
export const selectAuthPasskeySchema = createSelectSchema(authPasskey);
export const insertAuthPasskeySchema = createInsertSchema(authPasskey);
export const updateAuthPasskeySchema = createUpdateSchema(authPasskey);

// User schemas
export const selectUserSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user);
export const updateUserSchema = createUpdateSchema(user);
