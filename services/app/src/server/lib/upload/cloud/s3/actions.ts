'use server';

import { generateRandonFileName } from '@/server/lib/upload/utils';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { transactionImportFile } from '@db/schema';
import { s3Client } from '@server/lib/cloud/s3';
import { and, eq } from 'drizzle-orm';
import { TypeOf, z } from 'zod';

import { allowedFileTypes, maxFileSize } from './config';
import { S3UploadError } from './error';
import { SignedS3UrlInputSchema } from './schema';

/**
 * Delete an object that was uploaded to S3.
 */
export const deleteObject = async (bucket: string, key: string) => {
    try {
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: bucket,
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
};

/**
 * Create a signed URL for uploading a file to S3.
 */
export const getSignedS3Url = async (
    values: z.infer<typeof SignedS3UrlInputSchema>,
    userId: string
) => {
    // const { fileType, fileSize, checksum, key, bucket } = values;

    // first just make sure in our code that we're only allowing the file types we want
    if (!allowedFileTypes.includes(values.fileType)) {
        throw new S3UploadError('File type not allowed');
    }

    if (values.fileSize > maxFileSize) {
        throw new S3UploadError('File size too large');
    }

    const key = values.key || generateRandonFileName();

    const putObjectCommand = new PutObjectCommand({
        Bucket: values.bucket,
        Key: key,
        ContentType: values.fileType,
        ContentLength: values.fileSize,
        ChecksumSHA256: values.checksum,
        Metadata: {
            userId: userId
        }
    });

    const url = await getSignedUrl(
        s3Client,
        putObjectCommand,
        { expiresIn: 60 } // 60 seconds,
    );

    return { url, key, bucket: values.bucket };
};
