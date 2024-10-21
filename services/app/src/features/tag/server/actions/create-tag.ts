import { db } from '@db';
import { tag } from '@db/schema';
import { type TCreateTagValues } from '@features/tag/schema';
import { createId } from '@paralleldrive/cuid2';

/**
 * Create new tag.
 */
export const createTag = async (values: TCreateTagValues) => {
    const [newTag] = await db
        .insert(tag)
        .values({ ...values, id: createId() })
        .returning();

    return newTag;
};
