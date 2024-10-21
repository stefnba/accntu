import { db } from '@db';
import { tag, tagToTransaction } from '@db/schema';
import { and, count, eq } from 'drizzle-orm';
import { z } from 'zod';

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
