export const DEFAULT_LABEL_COLOR = '#6B7280';

export const labelColors = [
    '#EF4444', // red
    '#F97316', // orange
    '#F59E0B', // amber
    '#EAB308', // yellow
    '#84CC16', // lime
    '#22C55E', // green
    '#10B981', // emerald
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#A855F7', // purple
    '#EC4899', // pink
    '#F43F5E', // rose
    '#6B7280', // gray
] as const;

/**
 * Common Lucide React icon names for labels (using exact component names)
 */
export const labelIcons = [
    'Home',
    'ShoppingCart',
    'Car',
    'Plane',
    'Utensils',
    'Coffee',
    'Heart',
    'Gift',
    'Book',
    'Briefcase',
    'CreditCard',
    'Wallet',
    'Zap',
    'Phone',
    'Wifi',
    'Music',
    'Camera',
    'Monitor',
    'Smartphone',
    'DollarSign',
    'MapPin',
    'Calendar',
    'Clock',
    'User',
    'Users',
    'Building',
] as const;

export type LabelIcon = (typeof labelIcons)[number];
