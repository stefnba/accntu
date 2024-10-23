import { db } from '@db';
import { tag } from '@db/schema';
import { type TCreateTagValues } from '@features/tag/schema';
import { createId } from '@paralleldrive/cuid2';

/**
 * Create new tag.
 */
export const createTag = async ({
    userId,
    values
}: {
    values: TCreateTagValues;
    userId: string;
}) => {
    try {
        const [newTag] = await db
            .insert(tag)
            .values({ ...values, userId, id: createId() })
            .returning();

        return newTag;
    } catch (error: any) {
        if (error.code === '23505') {
            console.log('Duplicate tag name');
        }
        throw new Error(`Failed to create tag: ${error}`);
    }
};
