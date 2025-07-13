import { createUploadToS3Endpoints } from '@/lib/upload/cloud/s3/create-endpoints';
import { Hono } from 'hono';

const app = new Hono()

    /**
     * S3 upload endpoints for profile images
     */
    .route(
        '/upload-profile-image',
        createUploadToS3Endpoints({
            allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
            maxFileSize: 5 * 1024 * 1024, // 5MB for profile images
            bucket: process.env.AWS_BUCKET_NAME_PRIVATE_UPLOAD,
        })
    );

export default app;
