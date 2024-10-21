import { db } from '@/db';
import {
    TGetTagByIdParam,
    TGetTagByNameParam
} from '@features/tag/schema/get-tag';

/**
 * Retrieve a single tag by name.
 */
export const getTagByName = async ({ name, userId }: TGetTagByNameParam) => {
    return db.query.tag.findFirst({
        where: (fields, { and, eq }) =>
            and(eq(fields.userId, userId), eq(fields.name, name.toLowerCase()))
    });
};

/**
 * Retrieve a single tag by id.
 */
export const getTagById = async ({ id, userId }: TGetTagByIdParam) => {
    return db.query.tag.findFirst({
        where: (fields, { and, eq }) =>
            and(eq(fields.userId, userId), eq(fields.id, id))
    });
};
