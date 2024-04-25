'use server';

import { db, schema as dbSchema } from '@/db';
import { createFetch, createMutation } from '@/lib/actions';
import { and, eq, inArray } from 'drizzle-orm';

import { CreateImportSchema, FindImportByIdSchema } from './schema';

/**
 * Find import record by id.
 */
export const findById = createFetch(async ({ user, data: { id } }) => {
    const record = await db.query.transactionImport.findFirst({
        where: (fields, { eq, and }) =>
            and(eq(fields.id, id), eq(fields.userId, user.id)),
        with: {
            files: true
        }
    });

    if (!record) throw new Error('Import not found');

    return record;
}, FindImportByIdSchema);

/**
 * Mark import record (found by id) as successful.
 */
export const makeSuccess = createMutation(async ({ user, data: { id } }) => {
    await db
        .update(dbSchema.transactionImport)
        .set({
            successAt: new Date()
        })
        .where(
            and(
                eq(dbSchema.transactionImport.id, id),
                eq(dbSchema.transactionImport.userId, user.id)
            )
        )
        .returning();
}, FindImportByIdSchema);

/**
 * Create new import record.
 */
export const create = createMutation(
    async ({ user, data: { accountId, files } }) => {
        const newImport = await db
            .insert(dbSchema.transactionImport)
            .values({
                userId: user.id,
                accountId: accountId
            })
            .returning();

        if (newImport.length === 0 || newImport.length > 1)
            throw new Error('Failed to create import record');

        const newImportRecord = newImport[0];

        // Update files with importId
        await db
            .update(dbSchema.transactionImportFile)
            .set({ importId: newImportRecord.id })
            .where(inArray(dbSchema.transactionImportFile.id, files))
            .returning();

        return {
            id: newImportRecord.id
        };
    },
    CreateImportSchema
);
