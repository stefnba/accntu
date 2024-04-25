'use server';

import { db, schema as dbSchema } from '@/db';
import { createFetch, createMutation } from '@/lib/actions';
import { and, eq, inArray } from 'drizzle-orm';

import { CreateLabelSchema } from './schema';

/**
 * Create label record.
 */
export const create = createMutation(
    async ({ user, data: { name, parentLabelId } }) => {
        const newLabel = await db
            .insert(dbSchema.label)
            .values({
                name,
                parentId: parentLabelId,
                userId: user.id
            })
            .returning();

        return {
            ...newLabel[0],
            success: true
        };
    },
    CreateLabelSchema
);

/**
 * List label records for given user.
 */
export const list = createFetch(async ({ user }) => {
    return db.query.label.findMany({
        where: (fields, { eq }) => eq(fields.userId, user.id)
    });
});
