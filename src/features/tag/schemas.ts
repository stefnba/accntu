import { insertTagSchema, selectTagSchema, updateTagSchema } from '@/features/tag/server/db/schema';
import z from 'zod';

// ====================
// Query Layer
// ====================

export const tagQuerySchemas = {
    select: selectTagSchema,
    insert: insertTagSchema
        .omit({
            updatedAt: true,
            createdAt: true,
            id: true,
            userId: true,
        })
        .extend({
            color: z
                .string()
                .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format')
                .default('#6366f1'),
        }),
    update: updateTagSchema
        .pick({
            name: true,
            description: true,
            color: true,
        })
        .extend({
            color: z
                .string()
                .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color format')
                .default('#6366f1'),
        }),
};

export type TTagQuery = {
    select: z.infer<typeof tagQuerySchemas.select>;
    insert: z.infer<typeof tagQuerySchemas.insert>;
    update: z.infer<typeof tagQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const tagServiceSchemas = {
    create: tagQuerySchemas.insert.omit({}),
    update: tagQuerySchemas.update,
};

export type TTagService = {
    create: z.infer<typeof tagServiceSchemas.create>;
    update: z.infer<typeof tagServiceSchemas.update>;
};

// ====================
// Custom schemas
// ====================
