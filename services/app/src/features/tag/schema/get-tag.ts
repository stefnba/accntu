import { z } from 'zod';

export const GetTagByIdParamSchema = z.object({
    id: z.string(),
    userId: z.string()
});

export const GetTagByNameParamSchema = z.object({
    name: z.string(),
    userId: z.string()
});

export type TGetTagByIdParam = z.infer<typeof GetTagByIdParamSchema>;
export type TGetTagByNameParam = z.infer<typeof GetTagByNameParamSchema>;
