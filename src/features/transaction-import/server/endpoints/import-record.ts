import { transactionImportServiceSchemas } from '@/features/transaction-import/schemas';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';
import { TransactionImportCleanupService } from '../services/cleanup';
import { importRecordServices } from '../services/import-record';

const app = new Hono()
    /**
     * Get all transaction imports for the authenticated user
     */
    .get('/', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await importRecordServices.getAll({ userId: user.id });
        })
    )

    /**
     * Get transaction import by ID
     */
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await importRecordServices.getImportById({ id, userId: user.id });
        })
    )

    /**
     * Create new transaction import (always creates as draft)
     */
    .post('/', zValidator('json', transactionImportServiceSchemas.create), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');

                return await importRecordServices.create({
                    userId: user.id,
                    data,
                });
            },
            201
        )
    )

    /**
     * Activate draft import (change status from draft to pending)
     */
    .post('/:id/activate', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await importRecordServices.activate({
                id,
                userId: user.id,
            });
        })
    )

    /**
     * Update transaction import
     */
    .put(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', transactionImportServiceSchemas.update),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                return await importRecordServices.update({
                    id,
                    userId: user.id,
                    data,
                });
            })
    )

    /**
     * Delete transaction import
     */
    .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await importRecordServices.remove({
                id,
                userId: user.id,
            });
        })
    )

    /**
     * Cleanup old draft imports (for cron jobs)
     */
    .post('/cleanup', async (c) =>
        withRoute(c, async () => {
            const cleanedUpCount = await TransactionImportCleanupService.cleanupOldDraftImports();

            return {
                success: true,
                cleanedUpCount,
                message: `Successfully cleaned up ${cleanedUpCount} old draft imports`,
            };
        })
    );

export default app;
