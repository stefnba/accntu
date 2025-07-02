import { z } from 'zod';

export const appEnvBaseSchema = z
    .enum(['development', 'production', 'test'])
    .default('development');

// =========================
// Client
// =========================

// Client-side schema (NEXT_PUBLIC_ variables only)
export const clientEnvSchema = z.object({
    NODE_ENV: appEnvBaseSchema,
    NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
    NEXT_PUBLIC_APP_NAME: z.string().min(1, 'NEXT_PUBLIC_APP_NAME is required'),
});

// =========================
// Server App
// =========================

export const serverBaseEnvSchema = z
    .object({
        DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    })
    .and(clientEnvSchema);

// =========================
// Auth
// =========================

export const authEnvSchema = z.object({
    GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID is required'),
    GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET is required'),
    BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),
    BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),
});

// =========================
// Email
// =========================

const baseEmailEnvSchema = z.object({
    EMAIL_PROVIDER: z.enum(['resend', 'smtp', 'mailtrap']),
    EMAIL_FROM_NAME: z.string().optional(),
    EMAIL_FROM_ADDRESS: z.string().email('EMAIL_FROM_ADDRESS must be a valid email'),
});

const resendEmailEnvSchema = baseEmailEnvSchema.extend({
    EMAIL_PROVIDER: z.literal('resend'),
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required for resend provider'),
});

const smtpEmailEnvSchema = baseEmailEnvSchema.extend({
    EMAIL_PROVIDER: z.literal('smtp'),
    SMTP_HOST: z.string().min(1, 'SMTP_HOST is required for smtp provider'),
    SMTP_PORT: z.coerce.number().min(1).max(65535, 'SMTP_PORT must be between 1 and 65535'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z.coerce.boolean().optional(),
});

const mailtrapEmailEnvSchema = baseEmailEnvSchema.extend({
    EMAIL_PROVIDER: z.literal('mailtrap'),
    MAILTRAP_HOST: z.string().min(1, 'MAILTRAP_HOST is required for mailtrap provider'),
    MAILTRAP_PORT: z.coerce.number().min(1).max(65535, 'MAILTRAP_PORT must be between 1 and 65535'),
    MAILTRAP_USER: z.string().min(1, 'MAILTRAP_USER is required for mailtrap provider'),
    MAILTRAP_PASS: z.string().min(1, 'MAILTRAP_PASS is required for mailtrap provider'),
});

export const emailEnvSchema = z.discriminatedUnion('EMAIL_PROVIDER', [
    resendEmailEnvSchema,
    smtpEmailEnvSchema,
    mailtrapEmailEnvSchema,
]);

// =========================
// AWS
// =========================

export const awsEnvSchema = z.object({
    AWS_BUCKET_REGION: z.string().min(1, 'AWS_BUCKET_REGION is required'),
    AWS_ACCESS_KEY: z.string().min(1, 'AWS_ACCESS_KEY is required'),
    AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
});
