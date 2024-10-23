import { tag } from '@db/schema';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const GetTagByIdParamSchema = z.object({
    id: z.string()
});

export const GetTagByNameParamSchema = z.object({
    name: z.string()
});

export type TGetTagByIdParam = z.infer<typeof GetTagByIdParamSchema>;
export type TGetTagByNameParam = z.infer<typeof GetTagByNameParamSchema>;

/**
 * Reponse from database for a single tag.
 */
export const SelectTagSchema = createSelectSchema(tag).pick({
    id: true,
    name: true,
    color: true,
    createdAt: true,
    description: true
});

export type TSelectTag = z.infer<typeof SelectTagSchema>;
