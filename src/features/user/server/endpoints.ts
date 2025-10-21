import { userSchemas } from '@/features/user/schemas';
import { userServices } from '@/features/user/server/services';
import { createUploadToS3Endpoints } from '@/lib/upload/cloud/s3/create-endpoints';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
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
    )
    .patch('/settings', zValidator('json', userSchemas.updateSettingsById.endpoint.json), async (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ user, validatedInput }) =>
                userServices.updateSettingsById({
                    ids: { id: user.id },
                    data: validatedInput.json,
                })
            )
    );

export default app;
