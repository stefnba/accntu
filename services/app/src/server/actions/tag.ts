import { db } from '@/db';
import {
    InsertTagSchema,
    InsertTagToTransactionSchema,
    tag,
    tagToTransaction
} from '@db/schema';
import { z } from 'zod';

export const GetTagByIdSchema = z.object({
    id: z.string(),
    userId: z.string()
});
export const GetTagByNameSchema = z.object({
    name: z.string(),
    userId: z.string()
});

/**
 * Create new tag.
 */
export const createTag = async (data: z.infer<typeof InsertTagSchema>) => {
    const [newTag] = await db.insert(tag).values(data).returning();

    return newTag;
};

/**
 * Entry action to assign a tag to a transaction. If the tag already exists for the user,
 * it'll be assigned only. If the tag doesn't exist, it'll be created and then assigned.
 */
// export const addTagToTransaction = async ({
//     transactionId,
//     data
// }: {
//     Pick<
//         z.infer<typeof InsertTagToTransactionSchema>,
//         'transactionId'
//     > & {
//         data: z.infer<typeof InsertTagSchema>;
//     }
// }) => {
//     let tagId: string | undefined = undefined;

//     const { name, userId } = data;

//     // check if tag exists, otherwise create it
//     const record = await getTagByName({ name, userId });

//     if (record) {
//         tagId = record.id;
//     } else {
//         const newTag = await createTag({ userId, name, id: 'asdf' });
//         if (!newTag) throw new Error('Not created');

//         tagId = newTag.id;
//     }

//     if (!tagId) throw new Error('asdfa');

//     // register relation
//     await createTagtoTransaction({ tagId, transactionId });
// };

/**
 * Create new tag relation to transaction table.
 */
export const createTagtoTransaction = async (
    data: z.infer<typeof InsertTagToTransactionSchema>
) => {
    const newTagToTransaction = await db
        .insert(tagToTransaction)
        .values(data)
        .returning();

    return newTagToTransaction;
};

/**
 * Retrieve a single tag by id.
 */
export const getTagById = async ({
    id,
    userId
}: z.infer<typeof GetTagByIdSchema>) => {
    return db.query.tag.findFirst({
        where: (fields, { and, eq }) =>
            and(eq(fields.userId, userId), eq(fields.id, id))
    });
};

/**
 * Retrieve a single tag by name.
 */
export const getTagByName = async ({
    name,
    userId
}: z.infer<typeof GetTagByNameSchema>) => {
    return db.query.tag.findFirst({
        where: (fields, { and, eq }) =>
            and(eq(fields.userId, userId), eq(fields.name, name.toLowerCase()))
    });
};

export const deleteTag = async ({
    id,
    userId
}: z.infer<typeof GetTagByIdSchema>) => {};

export const GetTagsSchema = z.object({
    userId: z.string()
});
export const getTags = async ({}: z.infer<typeof GetTagsSchema>) => {
    return;
};

/**
 * Update a tag.
 */
export const updateTag = async ({
    id,
    userId
}: z.infer<typeof GetTagByIdSchema>) => {};
