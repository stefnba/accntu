import {
    createFileFromS3Schema,
    updateFileStatusSchema,
} from '@/features/transaction-import/schemas';
import { getUser } from '@/lib/auth';
import { createUploadToS3Endpoints } from '@/lib/upload/cloud/s3/create-endpoints';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import * as importFileServices from '../db/services/import-file';

const app = new Hono()
    /**
     * Get all files by import ID
     */
    .get('/import/:importId', zValidator('param', z.object({ importId: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { importId } = c.req.valid('param');
            return await importFileServices.getByImport({ importId });
        })
    )

    /**
     * Get file by ID
     */
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return await importFileServices.getById({ fileId: id });
        })
    )

    /**
     * Create file record from S3 upload
     */
    .post('/from-s3', zValidator('json', createFileFromS3Schema), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');

                return await importFileServices.createFromS3Upload({
                    userId: user.id,
                    ...data,
                });
            },
            201
        )
    )

    /**
     * Update file status and processing information
     */
    .put(
        '/:id/status',
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', updateFileStatusSchema),
        async (c) =>
            withRoute(c, async () => {
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                return await importFileServices.updateStatus({
                    fileId: id,
                    ...data,
                });
            })
    )

    /**
     * Delete file
     */
    .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await importFileServices.remove({
                fileId: id,
                userId: user.id,
            });
        })
    )

    /**
     * Parse file (placeholder for future implementation)
     */
    .post('/:id/parse', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return {
                success: true,
                message: 'File parsing will be implemented in future',
            };
        })
    )

    /**
     * S3 upload endpoints (signed URLs)
     */
    .route(
        '/upload',
        createUploadToS3Endpoints({
            allowedFileTypes: [
                'text/csv',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ],
            maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
            bucket: process.env.AWS_BUCKET_NAME_PRIVATE_UPLOAD,
        })
    );

export default app;
