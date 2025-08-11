import { z } from 'zod';

/**
 * Database-stored user settings (synced across devices)
 */
export const userDatabaseSettingsSchema = z.object({
    appearance: z
        .object({
            theme: z.enum(['light', 'dark', 'system']).default('system'),
            accentColor: z.string().default('#3b82f6'),
            fontSize: z.enum(['sm', 'md', 'lg']).default('md'),
            compactMode: z.boolean().default(false),
        })
        .default({}),
    notifications: z
        .object({
            email: z.boolean().default(true),
            push: z.boolean().default(false),
            marketing: z.boolean().default(false),
            transactionAlerts: z.boolean().default(true),
            weeklyReports: z.boolean().default(true),
            monthlyReports: z.boolean().default(true),
        })
        .default({}),
    privacy: z
        .object({
            profileVisibility: z.enum(['public', 'private']).default('private'),
            showLastLogin: z.boolean().default(false),
            shareAnalytics: z.boolean().default(true),
            dataDeletion: z.boolean().default(false),
        })
        .default({}),
    financial: z
        .object({
            defaultCurrency: z.string().length(3).default('USD'),
            hideAmounts: z.boolean().default(false),
            roundingMode: z.enum(['none', 'nearest', 'up', 'down']).default('nearest'),
            showCents: z.boolean().default(true),
        })
        .default({}),
});

export type TUserDatabaseSettings = z.infer<typeof userDatabaseSettingsSchema>;

/**
 * Local storage only preferences (device/session specific)
 */
export const userLocalPreferencesSchema = z.object({
    ui: z
        .object({
            sidebarCollapsed: z.boolean().default(false),
            tablePageSize: z.number().default(50),
            showAdvancedFilters: z.boolean().default(false),
            animationsEnabled: z.boolean().default(true),
        })
        .default({}),
    session: z
        .object({
            lastSelectedAccount: z.string().optional(),
            recentFilters: z.array(z.string()).default([]),
            tableColumnWidths: z.record(z.number()).default({}),
        })
        .default({}),
});

export type TUserLocalPreferences = z.infer<typeof userLocalPreferencesSchema>;

/**
 * Legacy: Client-side preferences schemas (keeping for backward compatibility)
 */
export const userPreferencesSchemas = {
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    appearance: z.object({
        theme: z.enum(['light', 'dark', 'system']).default('system'),
        accentColor: z.string().default('#3b82f6'),
        fontSize: z.enum(['sm', 'md', 'lg']).default('md'),
        compactMode: z.boolean().default(false),
    }),
    notifications: z.object({
        email: z.boolean().default(true),
        push: z.boolean().default(false),
        marketing: z.boolean().default(false),
        transactionAlerts: z.boolean().default(true),
        weeklyReports: z.boolean().default(true),
        monthlyReports: z.boolean().default(true),
    }),
    privacy: z.object({
        profileVisibility: z.enum(['public', 'private']).default('private'),
        showLastLogin: z.boolean().default(false),
        shareAnalytics: z.boolean().default(true),
        dataDeletion: z.boolean().default(false),
    }),
    financial: z.object({
        defaultCurrency: z.string().length(3).default('USD'),
        hideAmounts: z.boolean().default(false),
        roundingMode: z.enum(['none', 'nearest', 'up', 'down']).default('nearest'),
        showCents: z.boolean().default(true),
    }),
};

export type TUserPreferences = {
    theme: z.infer<typeof userPreferencesSchemas.theme>;
    appearance: z.infer<typeof userPreferencesSchemas.appearance>;
    notifications: z.infer<typeof userPreferencesSchemas.notifications>;
    privacy: z.infer<typeof userPreferencesSchemas.privacy>;
    financial: z.infer<typeof userPreferencesSchemas.financial>;
};

/**
 * Combined preferences schema for forms
 */
export const allUserPreferencesSchema = z.object({
    appearance: userPreferencesSchemas.appearance,
    notifications: userPreferencesSchemas.notifications,
    privacy: userPreferencesSchemas.privacy,
    financial: userPreferencesSchemas.financial,
});

export type TAllUserPreferences = z.infer<typeof allUserPreferencesSchema>;

/**
 * User avatar size variants
 */
export const userAvatarSizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
} as const;

export type UserAvatarSize = keyof typeof userAvatarSizes;

/**
 * Common validation patterns
 */
export const userValidationPatterns = {
    name: z
        .string()
        .min(1, 'Name is required')
        .max(50, 'Name must be less than 50 characters')
        .regex(
            /^[a-zA-ZÀ-ÿ\s'-]+$/,
            'Name can only contain letters, spaces, hyphens, and apostrophes'
        ),

    displayName: z
        .string()
        .min(2, 'Display name must be at least 2 characters')
        .max(30, 'Display name must be less than 30 characters')
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            'Display name can only contain letters, numbers, underscores, and hyphens'
        ),
} as const;
