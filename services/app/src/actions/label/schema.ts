import { z } from 'zod';

export const CreateLabelSchema = z.object({
    name: z.string(),
    parentLabelId: z.string().nullable().default(null)
});

export const FindLabelSchema = z.object({
    id: z.string()
});

export const UpdateLabelSchema = z.object({
    id: z.string(),
    data: z
        .union([
            z.object({
                name: z.string().optional(),
                parentLabelId: z.string().optional()
            }),
            z.object({ delete: z.boolean() })
        ])
        .transform((data) => {
            console.log(data);
            return data;
        })
});

export const listLabelByParentIdSchema = z.object({
    parentId: z.string().optional().nullable().default(null)
});
