'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { db, schema as dbSchema } from '@/db';
import { createFetch, createMutation, createQueryFetch } from '@/lib/actions';
import { and, eq, inArray } from 'drizzle-orm';

import {
    CreateLabelSchema,
    FindLabelSchema,
    UpdateLabelSchema,
    listLabelByParentIdSchema
} from './schema';

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

        revalidatePath('/settings/label');
        redirect('/settings/label');

        return {
            ...newLabel[0],
            success: true
        };
    },
    CreateLabelSchema
);

/**
 * List label records. If parentId is not provided, it will list all parent labels.
 * If parentId is provided, it will list all child records for that parent Label.
 */
export const list = createQueryFetch(async ({ user, data: { parentId } }) => {
    const records = await db.query.label.findMany({
        with: {
            childLabels: {
                where: (fields, { eq }) => eq(fields.isDeleted, false)
            },
            parentLabel: {
                with: {
                    parentLabel: true
                }
            }
        },
        where: (fields, { eq, and, isNull }) =>
            and(
                eq(fields.userId, user.id),
                parentId
                    ? eq(fields.parentId, parentId)
                    : isNull(fields.parentId),
                eq(fields.isDeleted, false)
            )
    });

    console.log(records.length);

    return records;
}, listLabelByParentIdSchema);

/**
 * Update a record.
 * Can also be used to delete a record.
 */
export const update = createMutation(async ({ user, data: { id, data } }) => {
    console.log(111, id, data);
    const updateData = 'delete' in data ? { isDeleted: data.delete } : data;

    await db
        .update(dbSchema.label)
        .set({
            ...updateData,
            updatedAt: new Date()
        })
        .where(
            and(eq(dbSchema.label.userId, user.id), eq(dbSchema.label.id, id))
        );

    revalidatePath('/settings/label');
    redirect('/settings/label');
}, UpdateLabelSchema);

/**
 * Find label by id.
 */
export const findById = createFetch(async ({ user, data: { id } }) => {
    return db.query.label.findFirst({
        with: {
            parentLabel: true
        },
        where: (fields, { and, eq }) =>
            and(
                eq(fields.id, id),
                eq(fields.userId, user.id),
                eq(fields.isDeleted, false)
            )
    });
}, FindLabelSchema);
