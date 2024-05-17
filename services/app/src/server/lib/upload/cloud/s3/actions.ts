'use server';

import { createFetch, createMutation } from '@/lib/actions';
import { s3Client } from '@/lib/cloud/s3';
import { db, schema as dbSchema } from '@/server/db/client';
import { generateRandonFileName } from '@/server/lib/upload/utils';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { and, eq } from 'drizzle-orm';

import { allowedFileTypes, maxFileSize } from './config';
import { S3UploadError } from './error';
import {
    CreateUploadRecordSchema,
    DeleteUploadRecordSchema,
    SignedS3UrlInputSchema
} from './schema';

/**
 * Create an upload record.
 */
export const createUploadRecord = createMutation(async ({ data, user }) => {
    const records = await db
        .insert(dbSchema.transactionImportFile)
        .values({
            userId: user.id,
            url: data.url,
            type: data.type,
            filename: data.filename
        })
        .returning();

    return records[0];
}, CreateUploadRecordSchema);

/**
 * Delete an upload record.
 */
export const deleteUploadRecord = createMutation(async ({ data, user }) => {
    try {
        // delete from the database
        const deletedFiles = await db
            .delete(dbSchema.transactionImportFile)
            .where(
                and(
                    eq(dbSchema.transactionImportFile.userId, user.id),
                    eq(dbSchema.transactionImportFile.id, data.id)
                )
            )
            .returning();

        const deletedFile = deletedFiles[0];

        // delete from s3
        const url = deletedFile.url;
        const key = url.split('/').slice(-1)[0];

        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: key
            })
        );

        return {
            success: true
        };
    } catch (e) {
        console.error('Error deleting file from s3', e);
        return {
            error: 'Error deleting file from s3'
        };
    }
}, DeleteUploadRecordSchema);

/**
 * Create a signed URL for uploading a file to S3.
 */
export const getSignedS3Url = createFetch(async ({ data, user }) => {
    const { fileType, fileSize, checksum, key } = data;

    // first just make sure in our code that we're only allowing the file types we want
    if (!allowedFileTypes.includes(fileType)) {
        throw new S3UploadError('File type not allowed');
    }

    if (fileSize > maxFileSize) {
        throw new S3UploadError('File size too large');
    }

    const objectKey = key || generateRandonFileName();

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: objectKey,
        ContentType: fileType,
        ContentLength: fileSize,
        ChecksumSHA256: checksum,
        Metadata: {
            userId: user.id
        }
    });

    const url = await getSignedUrl(
        s3Client,
        putObjectCommand,
        { expiresIn: 60 } // 60 seconds,
    );

    return { url, key: objectKey };
}, SignedS3UrlInputSchema);
