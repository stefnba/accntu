import { z } from 'zod';

export const CreateLabelSchema = z.object({
    parentId: z.string().optional(),
    color: z.string().optional(),
    name: z.string().trim().min(1).max(255),
    description: z.string().optional().nullish()
});
