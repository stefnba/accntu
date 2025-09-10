import { transactionImportSchemas } from '@/features/transaction-import/schemas/import-record';
import { transactionImportServices } from '@/features/transaction-import/server/services/import-record';
import { getUser } from '@/lib/auth';
import { withMutationRoute, withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    /**
     * Get all transaction imports for the authenticated user
     */
    .get('/', zValidator('query', transactionImportSchemas.getMany.endpoint.query), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { page, pageSize, ...filters } = c.req.valid('query');
            return await transactionImportServices.getMany({
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
     * Get transaction import by ID
     */
    .get('/:id', zValidator('param', transactionImportSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            return await transactionImportServices.getById({ ids: { id }, userId: user.id });
        })
    )

    /**
     * Create new transaction import
     */
    .post('/', zValidator('json', transactionImportSchemas.create.endpoint.json), async (c) =>
        withMutationRoute(c, async () => {
            const user = getUser(c);
            const data = c.req.valid('json');

            return await transactionImportServices.create({
                userId: user.id,
                data,
            });
        })
    )

    /**
     * Activate draft import (change status from draft to pending)
     */
    .post('/:id/activate', zValidator('param', transactionImportSchemas.getById.endpoint.param), async (c) =>
        withMutationRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await transactionImportServices.activate({
                ids: { id },
                userId: user.id,
            });
        })
    )

    /**
     * Update transaction import
     */
    .patch(
        '/:id',
        zValidator('param', transactionImportSchemas.updateById.endpoint.param),
        zValidator('json', transactionImportSchemas.updateById.endpoint.json),
        async (c) =>
            withMutationRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                return await transactionImportServices.updateById({
                    ids: { id },
                    userId: user.id,
                    data,
                });
            })
    )

    /**
     * Delete transaction import
     */
    .delete('/:id', zValidator('param', transactionImportSchemas.removeById.endpoint.param), async (c) =>
        withMutationRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await transactionImportServices.removeById({
                ids: { id },
                userId: user.id,
            });
        })
    );

export default app;