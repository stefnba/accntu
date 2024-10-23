import { db } from '@db';
import { tagToTransaction } from '@db/schema';
import { TAddTagToTransactionValues } from '@features/tag/schema';

import { createTag } from './create-tag';
import { getTagByName } from './get-tag';

/**
 * Entry action to assign a tag to a transaction. If the tag already exists for the user,
 * it'll be assigned only. If the tag doesn't exist, it'll be created and then assigned.
 */
export const addTagToTransaction = async ({
    tagId,
    transactionId,
    name,
    userId
}: TAddTagToTransactionValues & { userId: string }) => {
    let currentTagId: string | undefined = tagId;

    // check if tag exists, otherwise create it
    if (!currentTagId && !name) throw new Error('No tagId or name provided');

    // name is provided, check if tag exists
    if (!currentTagId && name) {
        const recordWithName = await getTagByName({ name, userId });
        if (recordWithName) {
            currentTagId = recordWithName.id;
        } else {
            console.log('creating tag');
            const newTag = await createTag({ userId, values: { name } });
            if (!newTag) throw new Error('Not created');

            currentTagId = newTag.id;
        }
    }

    // register relation
    if (currentTagId) {
        await db
            .insert(tagToTransaction)
            .values({ tagId: currentTagId, transactionId })
            .returning();
    }

    return {
        success: true
    };
};
