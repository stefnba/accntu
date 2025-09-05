import { globalBankAccountSchemas } from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

export const adminGlobalBankAccountEndpoints = new Hono()

    // Get all global bank accounts by bank id
    .get('/by-bank/:bankId', async (c) =>
        withRoute(c, async () => {
            const bankId = c.req.param('bankId');

            return await globalBankAccountServices.getMany({
                filters: { globalBankId: bankId },
                pagination: { page: 1, pageSize: 10 },
            });
        })
    )

    // Get a global bank account by id
    .get('/:id', zValidator('param', globalBankAccountSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const id = c.req.valid('param').id;

            return await globalBankAccountServices.getById({ ids: { id } });
        })
    )

    // Create a global bank account
    .post('/', zValidator('json', globalBankAccountSchemas.create.endpoint.json), async (c) =>
        withRoute(c, async () => {
            const data = c.req.valid('json');

            return await globalBankAccountServices.create({ data });
        })
    )

    // Update a global bank account
    .put(
        '/:id',
        zValidator('json', globalBankAccountSchemas.updateById.endpoint.json),
        zValidator('param', globalBankAccountSchemas.updateById.endpoint.param),
        async (c) =>
            withRoute(c, async () => {
                const id = c.req.valid('param').id;
                const data = c.req.valid('json');

                console.log(data);

                return await globalBankAccountServices.updateById({ ids: { id }, data });
            })
    )

    // Delete a global bank account
    .delete(
        '/:id',
        zValidator('param', globalBankAccountSchemas.removeById.endpoint.param),
        async (c) =>
            withRoute(c, async () => {
                const id = c.req.valid('param').id;

                return await globalBankAccountServices.removeById({ ids: { id } });
            })
    )

    // Test global bank account transformation query
    .post(
        '/test-transform-query',
        zValidator('json', globalBankAccountSchemas.testTransform.endpoint.json),
        async (c) =>
            withRoute(c, async () => {
                const data = c.req.valid('json');

                return await globalBankAccountServices.testTransform(data);
            })
    );
