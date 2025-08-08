import {
    insertLabelSchema,
    selectLabelSchema,
    updateLabelSchema,
} from '@/features/label/server/db/schema';
import { z } from 'zod';

// ====================
// Query
// ====================

export const labelQuerySchemas = {
    select: selectLabelSchema,
    selectFlattened: selectLabelSchema.extend({
        globalIndex: z.number().int(),
        countChildren: z.number().int(),
        hasChildren: z.boolean(),
        depth: z.number().int(),
        // Transform string dates from raw SQL to Date objects
        createdAt: z.string().transform((val) => new Date(val)),
        updatedAt: z.string().transform((val) => new Date(val)),
    }),
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
    reorder: z.array(
        insertLabelSchema
            .pick({
                id: true,
                index: true,
                parentId: true,
            })
            .extend({
                id: z.string(),
            })
    ),
    filter: z.object({
        search: z.string().optional(),
        parentId: z.string().optional(),
    }),
};
export type TLabelQuery = {
    select: z.infer<typeof labelQuerySchemas.select>;
    selectFlattened: z.infer<typeof labelQuerySchemas.selectFlattened>;
    insert: z.infer<typeof labelQuerySchemas.insert>;
    update: z.infer<typeof labelQuerySchemas.update>;
    filter: z.infer<typeof labelQuerySchemas.filter>;
    reorder: z.infer<typeof labelQuerySchemas.reorder>;
};

// ====================
// Service/Endpoint
// ====================
export const labelServiceSchemas = {
    select: labelQuerySchemas.select,
    insert: labelQuerySchemas.insert
        .omit({
            firstParentId: true,
            index: true,
        })
        .extend({
            name: z.string().min(1),
        }),
    update: labelQuerySchemas.update.omit({
        firstParentId: true,
        index: true,
    }),
    filter: labelQuerySchemas.filter,
    reorder: z.object({
        items: labelQuerySchemas.reorder,
    }),
};
export type TLabelService = {
    select: z.infer<typeof labelServiceSchemas.select>;
    selectFlattened: z.infer<typeof labelQuerySchemas.selectFlattened>;
    insert: z.infer<typeof labelServiceSchemas.insert>;
    update: z.infer<typeof labelServiceSchemas.update>;
    filter: z.infer<typeof labelServiceSchemas.filter>;
    reorder: z.infer<typeof labelServiceSchemas.reorder>;
};

// ====================
// UI
// ====================

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
