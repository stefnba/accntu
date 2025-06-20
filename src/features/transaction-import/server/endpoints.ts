import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import * as queries from './db/queries';

const createImportSchema = z.object({
    connectedBankAccountId: z.string(),
    fileName: z.string(),
    fileUrl: z.string(),
    fileSize: z.string().optional(),
});

const parseImportSchema = z.object({
    importId: z.string(),
});

const app = new Hono()
    .post('/create', zValidator('json', createImportSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { connectedBankAccountId, fileName, fileUrl, fileSize } = c.req.valid('json');

            const transactionImport = await queries.createTransactionImport({
                userId: user.id,
                connectedBankAccountId,
                fileName,
                fileUrl,
                fileSize,
                status: 'pending',
            });

            return { transactionImport };
        })
    )

    .get('/list', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const imports = await queries.getUserTransactionImports({ userId: user.id });
            return { imports };
        })
    )

    .get('/:importId', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const importId = c.req.param('importId');

            const transactionImport = await queries.getTransactionImport({
                id: importId,
                userId: user.id,
            });

            if (!transactionImport) {
                throw new Error('Import not found');
            }

            return { transactionImport };
        })
    )

    .post('/parse', zValidator('json', parseImportSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { importId } = c.req.valid('json');

            const transactionImport = await queries.getTransactionImport({
                id: importId,
                userId: user.id,
            });

            if (!transactionImport) {
                throw new Error('Import not found');
            }

            if (transactionImport.status !== 'pending') {
                throw new Error('Import is not in pending status');
            }

            await queries.updateTransactionImportStatus({
                id: importId,
                userId: user.id,
                status: 'processing',
            });

            try {
                return {
                    success: true,
                };
            } catch (error) {
                await queries.updateTransactionImportStatus({
                    id: importId,
                    userId: user.id,
                    status: 'failed',
                    parseErrors: [
                        { message: error instanceof Error ? error.message : 'Unknown error' },
                    ],
                });

                throw error;
            }
        })
    );

export default app;
