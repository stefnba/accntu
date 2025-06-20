'use server';

import { generateRandonFileName } from '@/lib/upload/utils';
import { s3Client } from '@/server/lib/cloud/s3/client';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';

import { S3UploadError } from './error';
import { SignedS3UrlInputSchema, TS3UploadConfig } from './schema';

/**
 * Delete an object that was uploaded to S3.
 */
export const deleteS3Object = async (bucket: string, key: string) => {
    // todo check if the user has permission to delete the file
    try {
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            })
        );

        return {
            success: true,
        };
    } catch (e) {
        console.error('Error deleting file from s3', e);
        return {
            error: 'Error deleting file from s3',
        };
    }
};

/**
 * Create a signed URL for uploading a file to S3.
 */
export const getSignedS3Url = async ({
    fileInput,
    config,
    userId,
}: {
    fileInput: z.infer<typeof SignedS3UrlInputSchema>;
    config: TS3UploadConfig;
    userId: string;
}) => {
    // first just make sure in our code that we're only allowing the file types we want
    if (!config.allowedFileTypes.includes(fileInput.fileType)) {
        throw new S3UploadError('File type not allowed');
    }

    if (fileInput.fileSize > config.maxFileSize) {
        throw new S3UploadError('File size too large');
    }

    const key = fileInput.key || generateRandonFileName();

    const putObjectCommand = new PutObjectCommand({
        Bucket: fileInput.bucket,
        Key: key,
        ContentType: fileInput.fileType,
        ContentLength: fileInput.fileSize,
        ChecksumSHA256: fileInput.checksum,
        Metadata: {
            userId: userId,
        },
    });

    const url = await getSignedUrl(
        s3Client,
        putObjectCommand,
        { expiresIn: 60 } // 60 seconds,
    );

    return { url, key, bucket: config.bucket };
};

/**
 * Upload a file to S3 using a signed URL.
 * @param url - The signed URL for the file.
 * @param file - The file to upload.
 * @returns - The response from the S3 upload.
 */
export const uploadFileToS3WithSignedUrl = async (url: string, file: File) => {
    const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload file to S3: ${errorText}`);
    }

    return {
        success: true,
    };
};
