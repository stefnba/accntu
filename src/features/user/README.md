# User Settings System

A comprehensive user preferences and settings management system with smart storage strategy.

## Architecture Overview

### Storage Strategy

#### Database Settings (Cross-Device Sync)

Stored in `user.settings` JSON column - synced across all user devices:

```typescript
{
  appearance: {
    theme: 'light' | 'dark' | 'system',
    accentColor: string,
    fontSize: 'sm' | 'md' | 'lg',
    compactMode: boolean
  },
  notifications: {
    email: boolean,
    push: boolean,
    marketing: boolean,
    transactionAlerts: boolean,
    weeklyReports: boolean,
    monthlyReports: boolean
  },
  privacy: {
    profileVisibility: 'public' | 'private',
    showLastLogin: boolean,
    shareAnalytics: boolean,
    dataDeletion: boolean
  },
  financial: {
    defaultCurrency: string, // 3-letter code
    hideAmounts: boolean,
    roundingMode: 'none' | 'nearest' | 'up' | 'down',
    showCents: boolean
  }
}
```

#### Local Storage (Device-Specific)

Stored in browser localStorage - device/session specific:

```typescript
{
  ui: {
    sidebarCollapsed: boolean,
    tablePageSize: number,
    showAdvancedFilters: boolean,
    animationsEnabled: boolean
  },
  session: {
    lastSelectedAccount?: string,
    recentFilters: string[],
    tableColumnWidths: Record<string, number>
  }
}
```

## Services

### useUserSettings

Main service for managing all user settings:

```typescript
import { useUserSettings } from '@/features/user/hooks';

const {
    // Database settings (synced)
    databaseSettings,
    updateDatabaseSettings,
    updateAppearanceSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    updateFinancialSettings,

    // Local preferences (device-specific)
    localPreferences,
    updateLocalPreferences,
    updateUIPreferences,
    updateSessionPreferences,

    // Direct access
    appearance,
    notifications,
    privacy,
    financial,
    ui,
    session,

    // State
    isLoaded,
    isUpdating,
} = useUserSettings();
```

### useEnhancedTheme

Theme service with database sync:

```typescript
import { useEnhancedTheme } from '@/features/user/hooks';

const {
    // Theme state
    theme, // 'light' | 'dark' | 'system'
    resolvedTheme, // 'light' | 'dark'
    isDark,
    isLight,
    isSystem,

    // Appearance settings
    accentColor,
    fontSize,
    compactMode,

    // Theme controls (with database sync)
    setTheme,
    setAccentColor,
    setFontSize,
    setCompactMode,

    // State
    isLoaded,
} = useEnhancedTheme();
```

## Components

### Modern Forms

Located in `src/features/user/components/preferences/`:

- **AppearancePreferencesForm** - Full appearance settings with database sync
- **NotificationPreferencesForm** - Email, push, and marketing preferences
- **PrivacyPreferencesForm** - Privacy and data sharing settings
- **FinancialPreferencesForm** - Currency and display preferences

### Legacy Forms

Located in `src/features/user/components/forms/`:

- **AppearanceForm** - Simple theme selector (updated to work with new system)
- **UserProfileForm** - User profile information (name, email, etc.)
- **UserImageForm** - Profile picture upload

### Main Components

- **UserManager** - Complete settings management interface with tabs
- **UserAvatar** - Reusable avatar component with fallbacks

## Usage Examples

### Database Settings (Synced Across Devices)

```typescript
// Update theme settings (syncs to database)
const { updateAppearanceSettings } = useUserSettings();

await updateAppearanceSettings({
    theme: 'dark',
    accentColor: '#ff6b6b',
    compactMode: true,
});

// Update notification preferences
const { updateNotificationSettings } = useUserSettings();

await updateNotificationSettings({
    email: true,
    transactionAlerts: false,
    weeklyReports: true,
});
```

### Local Preferences (Device-Specific)

```typescript
// Update UI preferences (localStorage only)
const { updateUIPreferences } = useUserSettings();

updateUIPreferences({
    sidebarCollapsed: true,
    tablePageSize: 100,
    showAdvancedFilters: false,
});

// Update session data
const { updateSessionPreferences } = useUserSettings();

updateSessionPreferences({
    lastSelectedAccount: 'account-123',
    recentFilters: ['income', 'recent'],
    tableColumnWidths: { name: 200, amount: 150 },
});
```

### Enhanced Theme Usage

```typescript
// Instant theme switching with database sync
const { setTheme, setAccentColor } = useEnhancedTheme();

// Changes UI immediately + syncs to database
setTheme('dark');
setAccentColor('#3b82f6');

// Check current theme
const { theme, isDark, resolvedTheme } = useEnhancedTheme();
if (isDark) {
    // Dark theme specific logic
}
```

### In Components

```typescript
'use client';

import { useUserSettings, useEnhancedTheme } from '@/features/user/hooks';

export const MyComponent = () => {
  const { financial, notifications } = useUserSettings();
  const { theme, accentColor } = useEnhancedTheme();

  const formatAmount = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: financial.defaultCurrency,
      minimumFractionDigits: financial.showCents ? 2 : 0,
    });

    return financial.hideAmounts ? '****' : formatter.format(amount);
  };

  return (
    <div style={{ color: accentColor }}>
      <p>Amount: {formatAmount(123.45)}</p>
      <p>Theme: {theme}</p>
      <p>Email notifications: {notifications.email ? 'On' : 'Off'}</p>
    </div>
  );
};
```

## Migration from localStorage

Existing localStorage preferences can be migrated to the database:

```typescript
const { updateDatabaseSettings } = useUserSettings();

// Migrate existing localStorage theme to database
const existingTheme = localStorage.getItem('theme');
if (existingTheme) {
    await updateDatabaseSettings({
        appearance: { theme: existingTheme as 'light' | 'dark' | 'system' },
    });
    localStorage.removeItem('theme'); // Clean up
}
```

## Database Schema

The user table includes a `settings` JSON column:

```sql
ALTER TABLE "user" ADD COLUMN "settings" text;
```

Settings are stored as JSON strings and validated with Zod schemas for type safety.

## Pages

User settings are accessible through these routes:

- `/user` - Account center with navigation
- `/user/appearance` - Theme and appearance settings
- `/user/notification` - Notification preferences
- `/user/privacy` - Privacy and security settings
- `/user/profile` - Profile information
- `/user/security` - Session management
- `/user/settings` - General settings

## Key Benefits

1. **Cross-device sync** - Settings follow users across devices
2. **Instant updates** - UI changes immediately, database syncs in background
3. **Type safety** - Full TypeScript support with Zod validation
4. **Performance** - Smart caching and efficient updates
5. **Flexibility** - Database for sync, localStorage for device-specific
6. **Migration friendly** - Easy to migrate existing localStorage preferences
7. **Granular control** - Update individual settings or entire sections
