import { db } from '@db';
import { type TGetTagsParam } from '@features/tag/schema';
import { sql } from 'drizzle-orm';

export const getTags = async ({ userId, search, exclude }: TGetTagsParam) => {
    return db.query.tag.findMany({
        where: (fields, { eq, notInArray, and, ilike }) =>
            and(
                eq(fields.userId, userId),
                exclude ? notInArray(fields.id, exclude) : undefined,
                search ? ilike(fields.name, `%${search}%`) : undefined
            ),
        orderBy: (fields) => [
            sql<string>`${fields.transactionCount} DESC NULLS LAST`,
            fields.name
        ]
    });
};
