import { db } from '@db';
import { label } from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { InferInsertModel, and, eq, isNull, max } from 'drizzle-orm';

/**
 * Create new label record.
 */
export const createLabel = async (
    values: Pick<
        InferInsertModel<typeof label>,
        'name' | 'parentId' | 'description' | 'color'
    >,
    userId: string
) => {
    let firstParentId: string | null = null;
    let level = 0;

    // if parentId is provided, assing level and firstParentId by getting parent label
    if (values.parentId) {
        const { parentId } = values;
        const parentLabel = await db.query.label.findFirst({
            where: (fields, { eq, and }) =>
                and(eq(fields.id, parentId), eq(fields.userId, userId))
        });

        if (!parentLabel) {
            throw new Error('Parent label not found');
        }

        level = parentLabel.level + 1;
        firstParentId = parentLabel.firstParentId || parentLabel.id;
    }

    // get rank for new label
    const [maxRank] = await db
        .select({ rank: max(label.rank) })
        .from(label)
        .where(
            and(
                eq(label.userId, userId),
                values.parentId
                    ? eq(label.parentId, values.parentId)
                    : isNull(label.parentId)
            )
        );

    const newRank = (maxRank?.rank ?? 0) + 1;

    const [newLabel] = await db
        .insert(label)
        .values({
            id: createId(),
            userId,
            ...values,
            rank: newRank,
            level,
            firstParentId
        })
        .returning();

    return newLabel;
};
