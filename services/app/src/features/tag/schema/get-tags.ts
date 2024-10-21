import { z } from 'zod';

export const GetTagsParamSchema = z.object({
    userId: z.string(),
    exclude: z.array(z.string()).optional(),
    search: z.string().optional()
});

export type TGetTagsParam = z.infer<typeof GetTagsParamSchema>;
