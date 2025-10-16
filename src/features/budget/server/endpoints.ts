import { transactionBudgetSchemas } from '@/features/budget/schemas';
import { budgetServices } from '@/features/budget/server/services';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    .get('/', zValidator('query', transactionBudgetSchemas.getMany.endpoint.query), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) => {
                const { page, pageSize, ...filters } = validatedInput.query;
                return await budgetServices.getMany({
                    pagination: { page, pageSize },
                    filters,
                    userId,
                });
            })
    )

    .get('/:id', zValidator('param', transactionBudgetSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) => {
                const budget = await budgetServices.getById({
                    ids: { id: validatedInput.param.id },
                    userId,
                });

                if (!budget) {
                    throw new Error('Transaction budget not found');
                }

                return budget;
            })
    )

    .post('/', zValidator('json', transactionBudgetSchemas.create.endpoint.json), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                budgetServices.create({ data: validatedInput.json, userId })
            )
    )

    .patch(
        '/:id',
        zValidator('param', transactionBudgetSchemas.updateById.endpoint.param),
        zValidator('json', transactionBudgetSchemas.updateById.endpoint.json),
        (c) =>
            routeHandler(c)
                .withUser()
                .handle(async ({ userId, validatedInput }) =>
                    budgetServices.updateById({
                        ids: { id: validatedInput.param.id },
                        data: validatedInput.json,
                        userId,
                    })
                )
    )

    .delete('/:id', zValidator('param', transactionBudgetSchemas.removeById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) => {
                await budgetServices.removeById({ ids: { id: validatedInput.param.id }, userId });
                return { success: true };
            })
    )

    .post(
        '/calculate',
        zValidator('json', transactionBudgetSchemas.calculateAndStore.endpoint.json),
        (c) =>
            routeHandler(c)
                .withUser()
                .handleMutation(async ({ userId, validatedInput }) =>
                    budgetServices.calculateAndStore({
                        transactionId: validatedInput.json.transactionId,
                        userId,
                    })
                )
    )

    .post(
        '/recalculate',
        zValidator('json', transactionBudgetSchemas.markForRecalculation.endpoint.json),
        (c) =>
            routeHandler(c)
                .withUser()
                .handle(async ({ userId, validatedInput }) => {
                    const { transactionId } = validatedInput.json;

                    await budgetServices.markForRecalculation({ transactionId });

                    const budget = await budgetServices.calculateAndStore({
                        transactionId,
                        userId,
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
