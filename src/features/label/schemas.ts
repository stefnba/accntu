import {
    insertLabelSchema,
    selectLabelSchema,
    updateLabelSchema,
} from '@/features/label/server/db/schema';
import { z } from 'zod';

/**
 * Label query schemas for database operations
 */
export const labelQuerySchemas = {
    select: selectLabelSchema,
    insert: insertLabelSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
    }),
    update: updateLabelSchema.omit({
        userId: true,
        createdAt: true,
        updatedAt: true,
        id: true,
    }),
    filter: z
        .object({
            search: z.string().optional(),
        })
        .optional(),
};
export type TLabelQuery = {
    select: z.infer<typeof labelQuerySchemas.select>;
    insert: z.infer<typeof labelQuerySchemas.insert>;
    update: z.infer<typeof labelQuerySchemas.update>;
    filter: z.infer<typeof labelQuerySchemas.filter>;
};
/**
 * Label service schemas for business logic operations
 */
export const labelServiceSchemas = {
    select: labelQuerySchemas.select,
    insert: labelQuerySchemas.insert.omit({
        firstParentId: true,
    }),
    update: labelQuerySchemas.update,
    filter: labelQuerySchemas.filter,
    reorder: z.object({
        updates: z.array(
            z.object({
                id: z.string(),
                sortOrder: z.number().int().min(0),
                parentId: z.string().nullable().optional(),
            })
        ),
    }),
};
export type TLabelService = {
    select: z.infer<typeof labelServiceSchemas.select>;
    insert: z.infer<typeof labelServiceSchemas.insert>;
    update: z.infer<typeof labelServiceSchemas.update>;
    filter: z.infer<typeof labelServiceSchemas.filter>;
    reorder: z.infer<typeof labelServiceSchemas.reorder>;
};

/**
 * Label form schemas for frontend form handling
 */
export const labelFormSchemas = {
    create: labelQuerySchemas.insert,
    update: labelQuerySchemas.update,
};

export type TLabelForm = {
    create: z.infer<typeof labelFormSchemas.create>;
    update: z.infer<typeof labelFormSchemas.update>;
};

/**
 * Available colors for labels
 */
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

/**
 * Enhanced form schema with icon validation
 */
export const labelFormSchemaExtended = {
    create: labelFormSchemas.create.extend({
        icon: z.string().optional(),
        imageUrl: z.string().url().optional(),
    }),
    update: labelFormSchemas.update.extend({
        icon: z.string().optional(),
        imageUrl: z.string().url().optional(),
    }),
};
