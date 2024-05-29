import { db } from '@db';
import { transactionImport, transactionImportFile } from '@db/schema';
import { and, eq, inArray } from 'drizzle-orm';

import { deleteObject } from '../lib/upload/cloud/s3/actions';

export const deleteImport = async (id: string, userId: string) => {
    // todo delete files on S3

    // Delete record from db
    const [deletedImport] = await db
        .delete(transactionImport)
        .where(
            and(
                eq(transactionImport.id, id),
                eq(transactionImport.userId, userId)
            )
        )
        .returning();

    if (!deletedImport) {
        console.error(`Import '${id}' doesn't exist`);
        throw new Error('Failed to delete import record');
    }

    return deletedImport;
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
