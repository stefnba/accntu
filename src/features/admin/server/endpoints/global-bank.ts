import {
    globalBankServiceSchemas,
    searchGlobalBanksSchema,
} from '@/features/bank/schemas/global-bank';
import { globalBankServices } from '@/features/bank/server/services/global-bank';
import { getUser } from '@/lib/auth/server';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const adminUserValidation = (c: any) => {
    const user = getUser(c);
    if (!user || user.role !== 'admin') {
        throw new Error('Admin access required');
    }
    return user;
};

export const adminGlobalBankEndpoints = new Hono()

    // Get all global banks
    .get('/', zValidator('query', searchGlobalBanksSchema.optional()), async (c) =>
        withRoute(c, async () => {
            adminUserValidation(c);
            const { query, country } = c.req.valid('query') || {};

            return await globalBankServices.getAll({
                filters: { query, country },
            });
        })
    )

    // Get a global bank by id
    .get('/:id', async (c) =>
        withRoute(c, async () => {
            adminUserValidation(c);
            const id = c.req.param('id');

            return await globalBankServices.getById({ id });
        })
    )

    // Create a global bank
    .post('/', zValidator('json', globalBankServiceSchemas.insert), async (c) =>
        withRoute(c, async () => {
            adminUserValidation(c);
            const data = c.req.valid('json');

            return await globalBankServices.create({ data });
        })
    )

    // Update a global bank
    .put('/:id', zValidator('json', globalBankServiceSchemas.update), async (c) =>
        withRoute(c, async () => {
            adminUserValidation(c);
            const id = c.req.param('id');
            const data = c.req.valid('json');

            return await globalBankServices.update({ id, data });
        })
    )

    // Delete a global bank
    .delete('/:id', async (c) =>
        withRoute(c, async () => {
            adminUserValidation(c);
            const id = c.req.param('id');

            return await globalBankServices.remove({ id });
        })
    );
