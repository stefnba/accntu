import { db } from '@/db';
import { tag } from '@db/schema';
import { CreateTagSchema, GetTagByIdParamSchema } from '@features/tag/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const SchemaWithoutUser = CreateTagSchema.omit({ userId: true });

/**
 * Update a tag.
 */
export const updateTag = async ({
    filter,
    values
}: {
    filter: z.infer<typeof GetTagByIdParamSchema>;
    values: z.infer<typeof SchemaWithoutUser>;
}) => {
    const [data] = await db
        .update(tag)
        .set(values)
        .where(and(eq(tag.id, filter.id), eq(tag.userId, filter.userId)))
        .returning();

    return data;
};
