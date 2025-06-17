import { tag, transactionTag } from '@/features/tag/server/db/schema';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

// ====================
// Database schemas
// ====================

// Tag
export const selectTagSchema = createSelectSchema(tag);
export type TTag = z.infer<typeof selectTagSchema>;

export const insertTagSchema = createInsertSchema(tag);
export type TInsertTag = z.infer<typeof insertTagSchema>;

export const updateTagSchema = createUpdateSchema(tag).pick({
    name: true,
    description: true,
    color: true,
    icon: true,
    type: true,
});
export type TUpdateTag = z.infer<typeof updateTagSchema>;

// Transaction Tag
export const selectTransactionTagSchema = createSelectSchema(transactionTag);
export type TTransactionTag = z.infer<typeof selectTransactionTagSchema>;

export const insertTransactionTagSchema = createInsertSchema(transactionTag);
export type TInsertTransactionTag = z.infer<typeof insertTransactionTagSchema>;

// ====================
// Custom schemas
// ====================

/**
 * Search tags schema
 */
export const searchTagsSchema = z
    .object({
        query: z.string().optional(),
        type: z.enum(['category', 'merchant', 'project', 'location', 'custom']).optional(),
    })
    .optional();

/**
 * Create tag with validation
 */
export const createTagSchema = z.object({
    name: z
        .string()
        .min(1, 'Tag name is required')
        .max(100, 'Tag name must be 100 characters or less'),
    description: z.string().optional(),
    color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format')
        .default('#6366f1'),
    icon: z.string().optional(),
    type: z.enum(['category', 'merchant', 'project', 'location', 'custom']).default('custom'),
});
export type TCreateTag = z.infer<typeof createTagSchema>;

/**
 * Update tag schema (partial create schema)
 */
export const updateTagFormSchema = createTagSchema.partial();
export type TUpdateTagForm = z.infer<typeof updateTagFormSchema>;

/**
 * Add tag to transaction schema
 */
export const addTagToTransactionSchema = z.object({
    transactionId: z.string().min(1, 'Transaction ID is required'),
    tagId: z.string().min(1, 'Tag ID is required'),
    source: z.enum(['manual', 'auto', 'imported']).default('manual'),
    confidence: z.enum(['high', 'medium', 'low']).optional(),
});
export type TAddTagToTransaction = z.infer<typeof addTagToTransactionSchema>;

/**
 * Transaction tag with tag details (for joined queries)
 */
export const transactionTagWithDetailsSchema = z.object({
    tag: selectTagSchema,
    transactionTag: selectTransactionTagSchema,
});
export type TTransactionTagWithDetails = z.infer<typeof transactionTagWithDetailsSchema>;

/**
 * Tag statistics
 */
export const tagStatsSchema = z.object({
    totalTags: z.number(),
    tagsByType: z.record(z.string(), z.number()),
    mostUsedTags: z.array(
        z.object({
            tag: selectTagSchema,
            count: z.number(),
        })
    ),
});
export type TTagStats = z.infer<typeof tagStatsSchema>;
