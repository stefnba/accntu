'use server';

import db from '@/db';
import { createAction } from '@/lib/actions';
import { s3Client } from '@/lib/cloud/s3';
import { createMutation } from '@/lib/mutation';
import { generateRandonFileName } from '@/lib/upload/utils';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Delete } from 'lucide-react';

import { allowedFileTypes, maxFileSize } from './config';
import { CreateUploadRecordSchema, DeleteUploadRecordSchema } from './schema';

type GetSignedS3UrlInput = {
    fileType: string;
    fileSize: number;
    checksum: string;
    key?: string;
};

type GetSignedS3UrlReturn = {
    url: string;
    key: string;
};

/**
 * Create an upload record.
 */
export const createUploadRecord = createMutation(async (data, user) => {
    return await db.importFile.create({
        data: {
            userId: user.id,
            url: data.url,
            type: data.type,
            filename: data.filename
        }
    });
}, CreateUploadRecordSchema);

/**
 * Delete an upload record.
 */
export const deleteUploadRecord = createMutation(async (data, user) => {
    try {
        // delete from the database
        await db.importFile
            .delete({
                where: { userId: user.id, id: data.id }
            })
            .then(async (deletedFile) => {
                // delete from s3
                const url = deletedFile.url;
                const key = url.split('/').slice(-1)[0];

                await s3Client.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.AWS_BUCKET_NAME!,
                        Key: key
                    })
                );
            });

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
 *
 */
export const getSignedS3Url = createAction<
    GetSignedS3UrlInput,
    GetSignedS3UrlReturn
>(async (data, user) => {
    const { fileType, fileSize, checksum, key } = data;

    // first just make sure in our code that we're only allowing the file types we want
    if (!allowedFileTypes.includes(fileType)) {
        return { error: 'File type not allowed' };
    }

    if (fileSize > maxFileSize) {
        return { error: 'File size too large' };
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

    return { success: { url, key: objectKey } };
});
