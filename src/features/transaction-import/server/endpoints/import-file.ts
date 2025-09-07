import { transactionImportFileSchemas } from '@/features/transaction-import/schemas/import-file';
import { transactionImportFileServices } from '@/features/transaction-import/server/services/import-file';
import { parseTransactionFile } from '@/features/transaction-import/server/services/transaction-parser';
import { getUser } from '@/lib/auth';
import { createUploadToS3Endpoints } from '@/lib/upload/cloud/s3/create-endpoints';
import { withMutationRoute, withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    /**
     * Get all transaction import files
     */
    .get('/', zValidator('query', transactionImportFileSchemas.getMany.endpoint.query), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { page, pageSize, ...filters } = c.req.valid('query');
            return await transactionImportFileServices.getMany({
                userId: user.id,
                filters,
                pagination: {
                    page,
                    pageSize,
                },
            });
        })
    )

    /**
     * Get file by ID
     */
    .get('/:id', zValidator('param', transactionImportFileSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            return await transactionImportFileServices.getById({ ids: { id }, userId: user.id });
        })
    )

    /**
     * Create file record from S3 upload
     */
    .post('/', zValidator('json', transactionImportFileSchemas.create.endpoint.json), async (c) =>
        withMutationRoute(c, async () => {
            const user = getUser(c);
            const data = c.req.valid('json');

            return await transactionImportFileServices.create({
                userId: user.id,
                data,
            });
        })
    )

    /**
     * Update file status and processing information
     */
    .put(
        '/:id',
        zValidator('param', transactionImportFileSchemas.updateById.endpoint.param),
        zValidator('json', transactionImportFileSchemas.updateById.endpoint.json),
        async (c) =>
            withMutationRoute(c, async () => {
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                const user = getUser(c);

                return await transactionImportFileServices.updateById({
                    ids: { id },
                    userId: user.id,
                    data,
                });
            })
    )

    /**
     * Delete file
     */
    .delete('/:id', zValidator('param', transactionImportFileSchemas.removeById.endpoint.param), async (c) =>
        withMutationRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await transactionImportFileServices.removeById({
                ids: { id },
                userId: user.id,
            });
        })
    )

    /**
     * Parse CSV file using DuckDB
     */
    .post('/:id/parse', zValidator('param', transactionImportFileSchemas.getById.endpoint.param), async (c) =>
        withMutationRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            const result = await parseTransactionFile({ id, userId: user.id });

            return result;
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