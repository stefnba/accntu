import { z } from 'zod';

import { SelectTagSchema } from './get-tag';

export const GetTagsParamSchema = z.object({
    userId: z.string(),
    exclude: z
        .union([z.array(z.string()), z.string()])
        .transform((v) => (Array.isArray(v) ? v : [v]))
        .optional(),
    // .transform((v) => (Array.isArray(v) ? v : [v])),
    search: z.string().optional()
});

export type TGetTagsParam = z.infer<typeof GetTagsParamSchema>;

export const SelectTagsSchema = z.array(SelectTagSchema);

export type TSelectTags = z.infer<typeof SelectTagsSchema>;
