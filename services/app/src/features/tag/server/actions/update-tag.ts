import { db } from '@db';
import { tag } from '@db/schema';
import {
    type TGetTagByIdParam,
    type TUpdateTagValues
} from '@features/tag/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Update a tag
 */
export const updateTag = async ({
    filter,
    values
}: {
    filter: TGetTagByIdParam & { userId: string };
    values: TUpdateTagValues;
}) => {
    const [data] = await db
        .update(tag)
        .set({ ...values, updatedAt: new Date().toDateString() })
        .where(and(eq(tag.id, filter.id), eq(tag.userId, filter.userId)))
        .returning();

    return data;
};
