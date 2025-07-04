import {
    transactionFilterOptionsSchema,
    transactionPaginationSchema,
    transactionParseDuplicateCheckSchema,
    transactionServiceSchemas,
} from '@/features/transaction/schemas';
import { transactionServices } from '@/features/transaction/server/services';
import { getUser } from '@/lib/auth';
import { endpointSelectSchema } from '@/lib/schemas';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    // Get transactions with filters and pagination
    .get(
        '/',
        zValidator(
            'query',
            transactionFilterOptionsSchema.extend(transactionPaginationSchema.shape)
        ),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { page, pageSize, ...filters } = c.req.valid('query');

                return await transactionServices.getAll({
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
            return await transactionServices.getFilterOptions(user.id);
        })
    )

    // Get single transaction by ID
    .get('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            const transaction = await transactionServices.getById({
                userId: user.id,
                id,
            });

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            return transaction;
        })
    )

    // update a transaction
    .patch(
        '/:id',
        zValidator('param', endpointSelectSchema),
        zValidator('json', transactionServiceSchemas.update),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                return await transactionServices.update({
                    id,
                    data,
                    userId: user.id,
                });
            })
    )

    // delete a transaction
    .delete('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');

            return await transactionServices.remove({
                id,
                userId: user.id,
            });
        })
    )

    // import transactions (bulk)
    .post(
        '/import',
        zValidator(
            'json',
            z.object({
                transactions: z.array(transactionParseDuplicateCheckSchema),
                importFileId: z.string(),
            })
        ),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { transactions, importFileId } = c.req.valid('json');

                return await transactionServices.createMany({
                    userId: user.id,
                    transactions,
                    importFileId,
                });
            })
    );

export default app;
