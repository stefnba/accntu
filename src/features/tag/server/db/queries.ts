import { type TInsertTag, type TTag } from '@/features/tag/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq, sql } from 'drizzle-orm';
import { tag, transactionTag } from './schema';

// Tag queries
export const createTag = async ({ data }: { data: TInsertTag }): Promise<TTag> =>
    withDbQuery({
        operation: 'create tag',
        queryFn: async () => {
            const [newTag] = await db.insert(tag).values(data).returning();
            return newTag;
        },
    });

export const getTagsByUserId = async ({ userId }: { userId: string }): Promise<TTag[]> =>
    withDbQuery({
        operation: 'get tags by user ID',
        queryFn: async () => {
            return await db
                .select()
                .from(tag)
                .where(and(eq(tag.userId, userId), eq(tag.isActive, true)))
                .orderBy(tag.name);
        },
    });

export const getTagById = async ({ id }: { id: string }): Promise<TTag | null> =>
    withDbQuery({
        operation: 'get tag by ID',
        queryFn: async () => {
            const [result] = await db.select().from(tag).where(eq(tag.id, id)).limit(1);
            return result || null;
        },
    });

export const updateTag = async ({
    id,
    data,
}: {
    id: string;
    data: Partial<TInsertTag>;
}): Promise<TTag | null> =>
    withDbQuery({
        operation: 'update tag',
        queryFn: async () => {
            const [updated] = await db
                .update(tag)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(tag.id, id))
                .returning();
            return updated || null;
        },
    });

export const deleteTag = async ({ id }: { id: string }): Promise<void> =>
    withDbQuery({
        operation: 'delete tag',
        queryFn: async () => {
            await db
                .update(tag)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(tag.id, id));
        },
    });

// Transaction tag queries
export const addTagToTransaction = async ({
    transactionId,
    tagId,
    source = 'manual',
    confidence,
}: {
    transactionId: string;
    tagId: string;
    source?: string;
    confidence?: string;
}) =>
    withDbQuery({
        operation: 'add tag to transaction',
        queryFn: async () => {
            const [result] = await db
                .insert(transactionTag)
                .values({
                    transactionId,
                    tagId,
                    source,
                    confidence,
                })
                .returning();

            // Update tag transaction count
            await db
                .update(tag)
                .set({
                    transactionCount: sql`${tag.transactionCount} + 1`,
                    updatedAt: new Date(),
                })
                .where(eq(tag.id, tagId));

            return result;
        },
    });

export const removeTagFromTransaction = async ({
    transactionId,
    tagId,
}: {
    transactionId: string;
    tagId: string;
}) =>
    withDbQuery({
        operation: 'remove tag from transaction',
        queryFn: async () => {
            await db
                .delete(transactionTag)
                .where(
                    and(
                        eq(transactionTag.transactionId, transactionId),
                        eq(transactionTag.tagId, tagId)
                    )
                );

            // Update tag transaction count
            await db
                .update(tag)
                .set({
                    transactionCount: sql`${tag.transactionCount} - 1`,
                    updatedAt: new Date(),
                })
                .where(eq(tag.id, tagId));
        },
    });

export const getTransactionTags = async ({ transactionId }: { transactionId: string }) =>
    withDbQuery({
        operation: 'get transaction tags',
        queryFn: async () => {
            return await db
                .select({
                    tag: tag,
                    transactionTag: transactionTag,
                })
                .from(transactionTag)
                .innerJoin(tag, eq(transactionTag.tagId, tag.id))
                .where(eq(transactionTag.transactionId, transactionId));
        },
    });

export const getTagsForTransaction = async ({
    transactionId,
}: {
    transactionId: string;
}): Promise<TTag[]> =>
    withDbQuery({
        operation: 'get tags for transaction',
        queryFn: async () => {
            const result = await db
                .select()
                .from(tag)
                .innerJoin(transactionTag, eq(tag.id, transactionTag.tagId))
                .where(eq(transactionTag.transactionId, transactionId));

            return result.map((row) => row.tag);
        },
    });

export const updateTagTransactionCount = async ({ tagId }: { tagId: string }) =>
    withDbQuery({
        operation: 'update tag transaction count',
        queryFn: async () => {
            const [result] = await db
                .select({
                    count: sql<number>`count(*)::int`,
                })
                .from(transactionTag)
                .where(eq(transactionTag.tagId, tagId));

            await db
                .update(tag)
                .set({
                    transactionCount: result?.count || 0,
                    updatedAt: new Date(),
                })
                .where(eq(tag.id, tagId));
        },
    });
