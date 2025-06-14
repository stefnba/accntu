import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { tag, transactionTag, type NewTag, type Tag } from './schema';

// Validation schemas
const TagSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    color: z.string(),
    icon: z.string().nullable(),
    type: z.enum(['category', 'merchant', 'project', 'location', 'custom']),
    parentTagId: z.string().nullable(),
    autoTagRules: z.array(z.string()).nullable(),
    transactionCount: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

const TagsArraySchema = z.array(TagSchema);

const TransactionTagSchema = z.object({
    transactionId: z.string(),
    tagId: z.string(),
    confidence: z.string().nullable(),
    source: z.string(),
    createdAt: z.date(),
});

// Tag queries
export const createTag = async ({ data }: { data: NewTag }): Promise<Tag> =>
    withDbQuery({
        outputSchema: TagSchema,
        operation: 'create tag',
        queryFn: async () => {
            const [newTag] = await db.insert(tag).values(data).returning();
            return newTag;
        },
    });

export const getTagsByUserId = async ({ userId }: { userId: string }): Promise<Tag[]> =>
    withDbQuery({
        outputSchema: TagsArraySchema,
        operation: 'get tags by user ID',
        queryFn: async () => {
            return await db
                .select()
                .from(tag)
                .where(and(eq(tag.userId, userId), eq(tag.isActive, true)))
                .orderBy(tag.name);
        },
    });

export const getTagById = async ({ id }: { id: string }): Promise<Tag | null> =>
    withDbQuery({
        outputSchema: TagSchema.nullable(),
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
    data: Partial<NewTag>;
}): Promise<Tag | null> =>
    withDbQuery({
        outputSchema: TagSchema.nullable(),
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
        outputSchema: z.void(),
        operation: 'delete tag',
        queryFn: async () => {
            await db
                .update(tag)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(tag.id, id));
        },
    });

export const getTagHierarchy = async ({ userId }: { userId: string }): Promise<Tag[]> =>
    withDbQuery({
        outputSchema: TagsArraySchema,
        operation: 'get tag hierarchy',
        queryFn: async () => {
            return await db
                .select()
                .from(tag)
                .where(and(eq(tag.userId, userId), eq(tag.isActive, true)))
                .orderBy(tag.parentTagId, tag.name);
        },
    });

export const getRootTags = async ({ userId }: { userId: string }): Promise<Tag[]> =>
    withDbQuery({
        outputSchema: TagsArraySchema,
        operation: 'get root tags',
        queryFn: async () => {
            return await db
                .select()
                .from(tag)
                .where(and(eq(tag.userId, userId), eq(tag.isActive, true), isNull(tag.parentTagId)))
                .orderBy(tag.name);
        },
    });

export const getChildTags = async ({ parentTagId }: { parentTagId: string }): Promise<Tag[]> =>
    withDbQuery({
        outputSchema: TagsArraySchema,
        operation: 'get child tags',
        queryFn: async () => {
            return await db
                .select()
                .from(tag)
                .where(and(eq(tag.parentTagId, parentTagId), eq(tag.isActive, true)))
                .orderBy(tag.name);
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
        outputSchema: TransactionTagSchema,
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
        outputSchema: z.void(),
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
        outputSchema: z.array(
            z.object({
                tag: TagSchema,
                transactionTag: TransactionTagSchema,
            })
        ),
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
}): Promise<Tag[]> =>
    withDbQuery({
        outputSchema: TagsArraySchema,
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

// Auto-tagging functionality
export const getTagsWithAutoRules = async ({ userId }: { userId: string }): Promise<Tag[]> =>
    withDbQuery({
        outputSchema: TagsArraySchema,
        operation: 'get tags with auto rules',
        queryFn: async () => {
            return await db
                .select()
                .from(tag)
                .where(
                    and(
                        eq(tag.userId, userId),
                        eq(tag.isActive, true),
                        sql`${tag.autoTagRules} IS NOT NULL AND array_length(${tag.autoTagRules}, 1) > 0`
                    )
                );
        },
    });

export const updateTagTransactionCount = async ({ tagId }: { tagId: string }) =>
    withDbQuery({
        outputSchema: z.void(),
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
