import { getUser } from '@/lib/auth';
import { createUploadToS3Endpoints } from '@/lib/upload/cloud/s3/create-endpoints';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import * as importFileServices from '../db/services/import-file';

const CreateImportFileSchema = z.object({
    importId: z.string().min(1, 'Import ID is required'),
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().url('Valid file URL is required'),
    fileType: z.string().min(1, 'File type is required'),
    fileSize: z.number().min(1, 'File size must be greater than 0'),
    storageType: z.enum(['s3', 'local']).default('s3'),
    bucket: z.string().optional(),
    key: z.string().optional(),
    relativePath: z.string().optional(),
});

const UpdateFileStatusSchema = z.object({
    status: z.enum(['uploaded', 'processing', 'processed', 'imported', 'failed']),
    transactionCount: z.number().optional(),
    importedTransactionCount: z.number().optional(),
    parseErrors: z.array(z.unknown()).optional(),
    parsedTransactions: z.array(z.unknown()).optional(),
});

const app = new Hono()
    .get('/import/:importId', zValidator('param', z.object({ importId: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { importId } = c.req.valid('param');
            return await importFileServices.getFilesByImport({ importId });
        })
    )
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return await importFileServices.getFileById({ fileId: id });
        })
    )
    .post('/', zValidator('json', CreateImportFileSchema), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');

                return await importFileServices.uploadFileToImport({
                    userId: user.id,
                    ...data,
                });
            },
            201
        )
    )
    .put(
        '/:id/status',
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', UpdateFileStatusSchema),
        async (c) =>
            withRoute(c, async () => {
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                return await importFileServices.updateFileStatus({
                    fileId: id,
                    ...data,
                });
            })
    )
    .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await importFileServices.deleteFile({
                fileId: id,
                userId: user.id,
            });
        })
    )
    .post('/:id/parse', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return {
                success: true,
            };
        })
    )

    // upload to s3
    .route(
        '/upload',
        createUploadToS3Endpoints({
            allowedFileTypes: [
                'text/csv',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ],
            maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
            bucket: process.env.NEXT_PUBLIC_S3_BUCKET || 'accntu-uploads',
        })
    );

export default app;
