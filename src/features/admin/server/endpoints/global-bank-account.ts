import {
    globalBankAccountServiceSchemas,
    testTransformSchema,
} from '@/features/bank/schemas/global-bank-account';
import { globalBankAccountServices } from '@/features/bank/server/services/global-bank-account';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

export const adminGlobalBankAccountEndpoints = new Hono()

    // Get all global bank accounts by bank id
    .get('/by-bank/:bankId', async (c) =>
        withRoute(c, async () => {
            const bankId = c.req.param('bankId');

            return await globalBankAccountServices.getAll({ filters: { globalBankId: bankId } });
        })
    )

    // Get a global bank account by id
    .get('/:id', async (c) =>
        withRoute(c, async () => {
            const id = c.req.param('id');

            return await globalBankAccountServices.getById({ id });
        })
    )

    // Create a global bank account
    .post('/', zValidator('json', globalBankAccountServiceSchemas.insert), async (c) =>
        withRoute(c, async () => {
            const data = c.req.valid('json');

            return await globalBankAccountServices.create({ data });
        })
    )

    // Update a global bank account
    .put('/:id', zValidator('json', globalBankAccountServiceSchemas.update), async (c) =>
        withRoute(c, async () => {
            const id = c.req.param('id');
            const data = c.req.valid('json');

            console.log(data);

            return await globalBankAccountServices.update({ id, data });
        })
    )

    // Delete a global bank account
    .delete('/:id', async (c) =>
        withRoute(c, async () => {
            const id = c.req.param('id');

            return await globalBankAccountServices.remove({ id });
        })
    )

    // Test global bank account transformation query
    .post('/test-transform-query', zValidator('json', testTransformSchema), async (c) =>
        withRoute(c, async () => {
            const data = c.req.valid('json');

            return await globalBankAccountServices.testTransformQuery(data);
        })
    );
