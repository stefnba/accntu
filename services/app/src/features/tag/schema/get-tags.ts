import { z } from 'zod';

import { SelectTagSchema } from './get-tag';

export const GetTagsParamSchema = z.object({
    userId: z.string(),
    exclude: z.array(z.string()).optional(),
    search: z.string().optional()
});

export type TGetTagsParam = z.infer<typeof GetTagsParamSchema>;

export const SelectTagsSchema = z.array(SelectTagSchema);

export type TSelectTags = z.infer<typeof SelectTagsSchema>;
