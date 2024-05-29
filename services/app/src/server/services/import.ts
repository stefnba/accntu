import { CreateImportSchema } from '@/features/import/schema/create-import';
import { db } from '@db';
import { transactionImport, transactionImportFile } from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { deleteObject } from '../lib/upload/cloud/s3/actions';

export const createImportFile = async (values: any) => {
    const newImportFile = await db
        .insert(transactionImportFile)
        .values({
            id: createId(),
            url: values.url,
            userId: values.userId,
            type: 'csv'
        })
        .returning();

    if (newImportFile.length === 0 || newImportFile.length > 1)
        throw new Error('Failed to create import file record');

    return {
        id: newImportFile[0].id
    };
};

/**
 * Delete import file record and delete file from S3.
 * @param id fileId.
 * @param userId userId.
 */
export const deleteImportFile = async (id: string, userId: string) => {
    // Delete record from db
    const [deletedFile] = await db
        .delete(transactionImportFile)
        .where(
            and(
                eq(transactionImportFile.id, id),
                eq(transactionImportFile.userId, userId)
            )
        )
        .returning();

    if (!deletedFile) {
        console.error(`File '${id}' doesn't exist`);
        throw new Error('Failed to delete import file record');
    }

    // Delete file from S3
    const url = deletedFile.url;
    const key = url.split('/').slice(-1)[0];
    const bucket = 'accntu';

    await deleteObject(bucket, key);

    return deletedFile;
};

export const createImport = async (
    values: z.infer<typeof CreateImportSchema>,
    userId: string
) => {
    const newImport = await db
        .insert(transactionImport)
        .values({
            id: createId(),
            userId: userId,
            accountId: values.accountId
        })
        .returning();

    if (newImport.length === 0 || newImport.length > 1)
        throw new Error('Failed to create import record');

    const newImportRecord = newImport[0];

    // Update files with importId.
    // File records already created before when uploading files.
    await db
        .update(transactionImportFile)
        .set({ importId: newImportRecord.id })
        .where(inArray(transactionImportFile.id, values.fileIds))
        .returning();

    return {
        id: newImportRecord.id
    };
};

/**
 * Update import record.
 */
export const updateImport = async (values: any, id: string, userId: string) => {
    await db
        .update(transactionImport)
        .set({
            successAt: new Date()
        })
        .where(
            and(
                eq(transactionImport.id, id),
                eq(transactionImport.userId, userId)
            )
        )
        .returning();
};
