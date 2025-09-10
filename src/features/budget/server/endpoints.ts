import { transactionBudgetSchemas } from '@/features/budget/schemas';
import { budgetServices } from '@/features/budget/server/services';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

// Create Hono app with proper chaining for RPC type generation
const app = new Hono()
    // Get all transaction budgets for authenticated user
    .get('/', zValidator('query', transactionBudgetSchemas.getMany.endpoint.query), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { page, pageSize, ...filters } = c.req.valid('query');
            return await budgetServices.getMany({
                pagination: {
                    page,
                    pageSize,
                },
                filters,
                userId: user.id,
            });
        })
    )

    // Get transaction budget by ID
    .get('/:id', zValidator('param', transactionBudgetSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const budget = await budgetServices.getById({ ids: { id }, userId: user.id });

            if (!budget) {
                throw new Error('Transaction budget not found');
            }

            return budget;
        })
    )

    // Create a new transaction budget
    .post('/', zValidator('json', transactionBudgetSchemas.create.endpoint.json), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');
                return await budgetServices.create({ data, userId: user.id });
            },
            201
        )
    )

    // Update a transaction budget
    .patch(
        '/:id',
        zValidator('param', transactionBudgetSchemas.updateById.endpoint.param),
        zValidator('json', transactionBudgetSchemas.updateById.endpoint.json),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                return await budgetServices.updateById({ ids: { id }, data, userId: user.id });
            })
    )

    // Delete a transaction budget (soft delete)
    .delete(
        '/:id',
        zValidator('param', transactionBudgetSchemas.removeById.endpoint.param),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                await budgetServices.removeById({ ids: { id }, userId: user.id });
                return { success: true };
            })
    )

    // Calculate and store budget for a transaction
    .post(
        '/calculate',
        zValidator('json', transactionBudgetSchemas.calculateAndStore.endpoint.json),
        async (c) =>
            withRoute(
                c,
                async () => {
                    const user = getUser(c);
                    const { transactionId } = c.req.valid('json');
                    return await budgetServices.calculateAndStore({
                        transactionId,
                        userId: user.id,
                    });
                },
                201
            )
    )

    // Mark transaction budgets for recalculation
    .post(
        '/recalculate',
        zValidator('json', transactionBudgetSchemas.markForRecalculation.endpoint.json),
        async (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { transactionId } = c.req.valid('json');

                // Mark for recalculation
                await budgetServices.markForRecalculation({ transactionId });

                // Process recalculation for this user
                const budget = await budgetServices.calculateAndStore({
                    transactionId,
                    userId: user.id,
                });

                return budget;
            })
    );

// Process all pending recalculations
// .post('/process-pending', async (c) =>
//     withRoute(c, async () => {
//         const results = await budgetServices.processPendingRecalculations();
//         return { processed: results.length, results };
//     })
// );

export default app;
