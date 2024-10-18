import { db } from '@/db';
import {
    InsertTagSchema,
    InsertTagToTransactionSchema,
    tag,
    tagToTransaction
} from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { and, count, eq, sql } from 'drizzle-orm';
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
    const [newTag] = await db
        .insert(tag)
        .values({ id: createId(), ...data })
        .returning();

    return newTag;
};

export const TagAndTransactionSchema = z.object({
    tagId: z.string(),
    transactionId: z.string()
});

/**
 * Remove tag from transaction. If the tag has no more relations, it'll be deleted too.
 */
export const removeTagFromTransaction = async (
    data: z.infer<typeof TagAndTransactionSchema>
) => {
    const remove = await db
        .delete(tagToTransaction)
        .where(
            and(
                eq(tagToTransaction.tagId, data.tagId),
                eq(tagToTransaction.transactionId, data.transactionId)
            )
        )
        .returning();

    // count remaining rows to determine if tag should be deleted
    const [remaining] = await db
        .select({ count: count() })
        .from(tagToTransaction)
        .where(eq(tagToTransaction.tagId, data.tagId));

    if (remaining.count === 0) {
        await db.delete(tag).where(eq(tag.id, data.tagId));
    }
};

/**
 * Entry action to assign a tag to a transaction. If the tag already exists for the user,
 * it'll be assigned only. If the tag doesn't exist, it'll be created and then assigned.
 */
export const AddTagToTransactionSchema = z.object({
    tagId: z.string().optional(),
    transactionId: z.string(),
    name: z.string().optional(),
    userId: z.string()
});
export const addTagToTransaction = async ({
    tagId,
    transactionId,
    name,
    userId
}: z.infer<typeof AddTagToTransactionSchema>) => {
    console.log('tagId', tagId);
    console.log('name', name);
    console.log('user', userId);

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
            const newTag = await createTag({ userId, name });
            if (!newTag) throw new Error('Not created');

            currentTagId = newTag.id;
        }
    }

    if (currentTagId) {
        // register relation
        await createTagtoTransaction({ tagId: currentTagId, transactionId });
    }

    return {
        datA: 1
    };
};

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
    userId: z.string(),
    exclude: z.array(z.string()).optional(),
    search: z.string().optional()
});
export const getTags = async ({
    userId,
    search,
    exclude
}: z.infer<typeof GetTagsSchema>) => {
    return db.query.tag.findMany({
        where: (fields, { eq, notInArray, and, ilike }) =>
            and(
                eq(fields.userId, userId),
                exclude ? notInArray(fields.id, exclude) : undefined,
                search ? ilike(fields.name, `%${search}%`) : undefined
            )
    });
};

/**
 * Update a tag.
 */
export const updateTag = async ({
    id,
    userId
}: z.infer<typeof GetTagByIdSchema>) => {};
