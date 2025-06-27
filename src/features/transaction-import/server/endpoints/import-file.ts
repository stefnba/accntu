import { transactionImportFileServiceSchemas } from '@/features/transaction-import/schemas/import-file';
import * as importFileServices from '@/features/transaction-import/server/services/import-file';
import { parseTransaction } from '@/features/transaction-import/server/services/transaction-parser';
import { getUser } from '@/lib/auth';
import { endpointSelectSchema } from '@/lib/schemas';
import { createUploadToS3Endpoints } from '@/lib/upload/cloud/s3/create-endpoints';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    /**
     * Get all files by import ID
     */
    .get('/import/:importId', zValidator('param', z.object({ importId: z.string() })), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { importId } = c.req.valid('param');
            return await importFileServices.getByImport({ filters: { importId }, userId: user.id });
        })
    )

    /**
     * Get file by ID
     */
    .get('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            return await importFileServices.getById({ fileId: id, userId: user.id });
        })
    )

    /**
     * Create file record from S3 upload
     */
    .post('/from-s3', zValidator('json', transactionImportFileServiceSchemas.create), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');

                return await importFileServices.create({
                    userId: user.id,
                    data,
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
        zValidator('param', endpointSelectSchema),
        zValidator('json', transactionImportFileServiceSchemas.update),
        async (c) =>
            withRoute(c, async () => {
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                const user = getUser(c);

                return await importFileServices.update({
                    id,
                    userId: user.id,
                    data,
                });
            })
    )

    /**
     * Delete file
     */
    .delete('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await importFileServices.remove({
                id: id,
                userId: user.id,
            });
        })
    )

    /**
     * Parse CSV file using DuckDB
     */
    .post('/:id/parse', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            const { transformQuery, csvConfig } = await parseTransaction(id, user.id);

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
