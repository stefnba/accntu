import { db } from '@db';
import { type TGetTagsParam } from '@features/tag/schema';

export const getTags = async ({ userId, search, exclude }: TGetTagsParam) => {
    return db.query.tag.findMany({
        where: (fields, { eq, notInArray, and, ilike }) =>
            and(
                eq(fields.userId, userId),
                exclude ? notInArray(fields.id, exclude) : undefined,
                search ? ilike(fields.name, `%${search}%`) : undefined
            )
    });
};
