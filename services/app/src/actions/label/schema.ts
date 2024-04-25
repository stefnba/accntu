import { z } from 'zod';

export const CreateLabelSchema = z.object({
    name: z.string(),
    parentLabelId: z.string().optional()
});

export const FindLabelSchema = z.object({
    id: z.string()
});
