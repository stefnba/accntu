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
};
export type TLabelQuery = {
    select: z.infer<typeof labelQuerySchemas.select>;
    insert: z.infer<typeof labelQuerySchemas.insert>;
    update: z.infer<typeof labelQuerySchemas.update>;
};
/**
 * Label service schemas for business logic operations
 */
export const labelServiceSchemas = {
    select: selectLabelSchema,
    insert: insertLabelSchema.omit({
        firstParentId: true,
    }),
    update: updateLabelSchema,
};
export type TLabelService = {
    select: z.infer<typeof labelServiceSchemas.select>;
    insert: z.infer<typeof labelServiceSchemas.insert>;
    update: z.infer<typeof labelServiceSchemas.update>;
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
