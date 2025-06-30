import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { Hono } from 'hono';

import { createLocalUploadService } from './service';

const uploadService = createLocalUploadService(
    { allowedFileTypes: ['csv', 'xlsx', 'xls'], maxFileSize: 10 * 1024 * 1024 },
    { baseDir: 'uploads/transaction-imports', preserveFileName: true }
);

const app = new Hono()
    .post('/upload', async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const formData = await c.req.formData();

                const file = formData.get('file') as File;
                const fileName = (formData.get('fileName') as string) || file.name;
                const subDirectory = (formData.get('subDirectory') as string) || undefined;

                if (!file) {
                    throw new Error('No file provided');
                }

                return await uploadService.uploadFile({
                    file,
                    fileName,
                    userId: user.id,
                    subDirectory,
                });
            },
            201
        )
    )
    .delete('/file', async (c) =>
        withRoute(c, async () => {
            const { filePath, relativePath } = await c.req.json();

            if (!filePath && !relativePath) {
                throw new Error('Either filePath or relativePath must be provided');
            }

            return await uploadService.deleteFile({ filePath, relativePath });
        })
    )
    .get('/file/info', async (c) =>
        withRoute(c, async () => {
            const filePath = c.req.query('filePath');
            const relativePath = c.req.query('relativePath');

            if (!filePath && !relativePath) {
                throw new Error('Either filePath or relativePath must be provided');
            }

            return await uploadService.getFileInfo({ filePath, relativePath });
        })
    );

export default app;
