import { connectedBankSchemas } from '@/features/bank/schemas/connected-bank';
import { connectedBankServices } from '@/features/bank/server/services/connected-bank';
import { getUser } from '@/lib/auth';
import { withMutationRoute, withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    /**
     * Get all connected banks for the current user
     */
    .get('/', zValidator('query', connectedBankSchemas.getMany.endpoint.query), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { page, pageSize, ...filters } = c.req.valid('query');
            return await connectedBankServices.getMany({
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
     * Get a connected bank by id for the current user
     */
    .get('/:id', zValidator('param', connectedBankSchemas.getById.endpoint.param), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const user = getUser(c);
            return await connectedBankServices.getById({ ids: { id }, userId: user.id });
        })
    )

    /**
     * Create a new connected bank together with the related bank accounts
     */
    .post('/', zValidator('json', connectedBankSchemas.create.endpoint.json), async (c) =>
        withMutationRoute(c, async () => {
            const user = getUser(c);
            const data = c.req.valid('json');

            const connectedBank = await connectedBankServices.createWithAccounts({
                userId: user.id,
                data: {
                    ...data,
                    connectedBankAccounts: data.connectedBankAccounts,
                },
            });
            return connectedBank;
        })
    );

export default app;
