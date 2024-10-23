import { db } from '@db';
import { tag } from '@db/schema';
import { type TGetTagByIdParam } from '@features/tag/schema';
import { and, eq } from 'drizzle-orm';

type Params = TGetTagByIdParam & { userId: string };

export const deleteTag = async ({ id, userId }: Params) => {
    const [data] = await db
        .delete(tag)
        .where(and(eq(tag.id, id), eq(tag.userId, userId)))
        .returning({ id: tag.id });

    return data;
};
