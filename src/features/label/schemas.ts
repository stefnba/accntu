import { label } from '@/features/label/server/db/schema';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

// ====================
// Database schemas
// ====================

// Label
export const selectLabelSchema = createSelectSchema(label);
export type TLabel = z.infer<typeof selectLabelSchema>;

export const insertLabelSchema = createInsertSchema(label);
export type TInsertLabel = z.infer<typeof insertLabelSchema>;

export const updateLabelSchema = createUpdateSchema(label).pick({
    name: true,
    description: true,
    color: true,
    rank: true,
    level: true,
    parentId: true,
    firstParentId: true,
});
export type TUpdateLabel = z.infer<typeof updateLabelSchema>;

// ====================
// Custom schemas
// ====================

/**
 * Search labels schema
 */
export const searchLabelsSchema = z
    .object({
        query: z.string().optional(),
        parentId: z.string().optional(),
        level: z.number().optional(),
    })
    .optional();

/**
 * Create label with validation
 */
export const createLabelSchema = z.object({
    name: z
        .string()
        .min(1, 'Label name is required')
        .max(100, 'Label name must be 100 characters or less'),
    description: z.string().optional(),
    color: z.string().optional(),
    rank: z.number().int().min(0).default(0),
    level: z.number().int().min(0).default(0),
    parentId: z.string().optional(),
    firstParentId: z.string().optional(),
});
export type TCreateLabel = z.infer<typeof createLabelSchema>;

/**
 * Update label schema (partial create schema)
 */
export const updateLabelFormSchema = createLabelSchema.partial();
export type TUpdateLabelForm = z.infer<typeof updateLabelFormSchema>;

/**
 * Label hierarchy item (for building tree structures)
 */
export const labelHierarchyItemSchema: z.ZodType<TLabelHierarchyItem> = selectLabelSchema.extend({
    children: z.array(z.lazy(() => labelHierarchyItemSchema)).optional(),
});
export type TLabelHierarchyItem = z.infer<typeof selectLabelSchema> & {
    children?: TLabelHierarchyItem[];
};

/**
 * Label with path information
 */
export const labelWithPathSchema = selectLabelSchema.extend({
    path: z.array(z.string()),
    breadcrumb: z.string(),
});
export type TLabelWithPath = z.infer<typeof labelWithPathSchema>;

/**
 * Label statistics
 */
export const labelStatsSchema = z.object({
    totalLabels: z.number(),
    labelsByLevel: z.record(z.string(), z.number()),
    maxDepth: z.number(),
    rootLabelsCount: z.number(),
});
export type TLabelStats = z.infer<typeof labelStatsSchema>;
