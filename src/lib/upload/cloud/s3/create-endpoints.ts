import { getUser } from '@/lib/auth';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { DeleteS3FileSchema, SignedS3UrlInputSchema, TS3UploadConfig } from './schema';
import { deleteS3Object, getSignedS3Url } from './services';

/**
 * Create endpoints for uploading files to S3. This can be injected into other endpoints and provide a
 * config to specify the allowed file types, max file size, and bucket.
 * @param config - The configuration for the S3 upload.
 * @returns - The endpoints for uploading files to S3.
 */
export const createUploadToS3Endpoints = (config: TS3UploadConfig) => {
    return (
        new Hono()

            // get a signed url to upload a file to s3
            .get('/get-signed-url', zValidator('query', SignedS3UrlInputSchema), async (c) => {
                const user = getUser(c);
                const values = c.req.valid('query');
                const { url, key, bucket } = await getSignedS3Url({
                    fileInput: values,
                    config,
                    userId: user.id,
                });
                return c.json({ url, key, bucket });
            })

            // delete a file from s3
            .delete('/delete-file', zValidator('json', DeleteS3FileSchema), async (c) => {
                const user = getUser(c);
                const values = c.req.valid('json');
                const { key, bucket } = values;
                await deleteS3Object(bucket, key);
                return c.json({ success: true });
            })
    );
};
