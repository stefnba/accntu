import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

import { transactionBudgetServiceSchemas } from '@/features/budget/schemas';
import { budgetService } from '@/features/budget/server/services';
import { getUser } from '@/lib/auth';
import { endpointSelectSchema } from '@/lib/schemas';
import { withRoute } from '@/server/lib/handler';

const app = new Hono()
    .get('/', (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const budgets = await budgetService.getAll({ userId: user.id });
            return budgets;
        })
    )
    .get('/:id', zValidator('param', endpointSelectSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const budget = await budgetService.getById({ id, userId: user.id });
            return budget;
        })
    )
    .post('/calculate', zValidator('json', transactionBudgetServiceSchemas.calculate), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { transactionId } = c.req.valid('json');
            const budget = await budgetService.calculateAndStore({
                transactionId,
                userId: user.id
            });
            return budget;
        }, 201)
    )
    .post('/recalculate', zValidator('json', transactionBudgetServiceSchemas.recalculate), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { transactionId } = c.req.valid('json');
            
            // Mark for recalculation
            await budgetService.markForRecalculation({ transactionId });
            
            // Process recalculation for this user
            const budget = await budgetService.calculateAndStore({
                transactionId,
                userId: user.id
            });
            
            return budget;
        })
    )
    .post('/process-pending', (c) =>
        withRoute(c, async () => {
            const results = await budgetService.processPendingRecalculations();
            return { processed: results.length, results };
        })
    )
    .post('/', zValidator('json', transactionBudgetServiceSchemas.create), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const data = c.req.valid('json');
            const newBudget = await budgetService.create({
                data,
                userId: user.id,
            });
            return newBudget;
        }, 201)
    )
    .patch('/:id', zValidator('json', transactionBudgetServiceSchemas.update), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.param();
            const values = c.req.valid('json');
            const updatedBudget = await budgetService.update({
                id,
                data: values,
                userId: user.id,
            });
            return updatedBudget;
        })
    )
    .delete('/:id', zValidator('param', endpointSelectSchema), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            return await budgetService.remove({ id, userId: user.id });
        })
    );

export default app;