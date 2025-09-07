import { transactionSchemas } from '@/features/transaction/schemas';
import {
    createMany,
    getFilterOptions,
    transactionServices,
} from '@/features/transaction/server/services';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    // Get transactions with filters and pagination
    .get('/', zValidator('query', transactionSchemas.getMany.endpoint.query), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const query = c.req.valid('query');
            const { page, pageSize, ...filters } = query;

            return await transactionServices.getMany({
                userId: user.id,
                filters,
                pagination: {
                    page,
                    pageSize,
                },
            });
        })
    )

    // Get filter options for transaction table
    .get('/filter-options', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await getFilterOptions(user.id);
        })
    )

    // Get single transaction by ID
    .get('/:id', zValidator('param', transactionSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const ids = c.req.valid('param');

            const transaction = await transactionServices.getById({
                userId: user.id,
                ids,
            });

            return transaction;
        })
    )

    // update a transaction
    .patch(
        '/:id',
        zValidator('param', transactionSchemas.updateById.endpoint.param),
        zValidator('json', transactionSchemas.updateById.endpoint.json),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const ids = c.req.valid('param');
                const data = c.req.valid('json');

                return await transactionServices.updateById({
                    ids,
                    data,
                    userId: user.id,
                });
            })
    )

    // delete a transaction
    .delete('/:id', zValidator('param', transactionSchemas.removeById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const ids = c.req.valid('param');

            return await transactionServices.removeById({
                ids,
                userId: user.id,
            });
        })
    )

    // create a new transaction
    .post('/', zValidator('json', transactionSchemas.create.endpoint.json), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');

                return await transactionServices.create({
                    data,
                    userId: user.id,
                });
            },
            201
        )
    )

    // import transactions (bulk)
    .post(
        '/import',
        zValidator(
            'json',
            z.object({
                transactions: z.array(z.any()),
                importFileId: z.string(),
            })
        ),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { transactions, importFileId } = c.req.valid('json');

                return await createMany({
                    userId: user.id,
                    transactions,
                    importFileId,
                });
            })
    );

export default app;
