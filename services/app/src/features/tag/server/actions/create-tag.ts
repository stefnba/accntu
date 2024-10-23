import { colorSelection } from '@/lib/constants';
import { ActionError } from '@/server/lib/error';
import { db } from '@db';
import { tag } from '@db/schema';
import { type TCreateTagValues } from '@features/tag/schema';
import { createId } from '@paralleldrive/cuid2';

/**
 * Error when tag with the same name already exists.
 */
export class DuplicateTagError extends ActionError {
    constructor() {
        super('Tag with the same name already exists');
    }
}

/**
 * Error when tag could not be created.
 */
export class CreationFailedError extends ActionError {
    constructor(error?: Error) {
        super('Tag could not be created', error);
    }
}

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
        let { color } = values;

        if (!color) {
            color =
                colorSelection[
                    Math.floor(Math.random() * colorSelection.length)
                ].value;
        }

        const [newTag] = await db
            .insert(tag)
            .values({ ...values, color, userId, id: createId() })
            .returning();
        return newTag;
    } catch (error: any) {
        if (error.code === '23505') {
            throw new DuplicateTagError();
        }
        throw new CreationFailedError(error);
    }
};
