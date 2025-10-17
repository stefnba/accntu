import { connectedBankAccountSchemas } from '@/features/bank/schemas/connected-bank-account';
import { connectedBankAccountServices } from '@/features/bank/server/services/connected-bank-account';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()

    /**
     * Get connected bank accounts
     */
    .get('/', async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                connectedBankAccountServices.getMany({
                    userId,
                    filters: validatedInput.filters,
                    pagination: validatedInput.pagination,
                })
            )
    )

    /**
     * Get connected bank account by ID
     */
    .get(
        '/:id',
        zValidator('param', connectedBankAccountSchemas.getById.endpoint.param),
        async (c) =>
            routeHandler(c)
                .withUser()
                .handle(async ({ userId, validatedInput }) =>
                    connectedBankAccountServices.getById({
                        ids: { id: validatedInput.param.id },
                        userId,
                    })
                )
    )

    /**
     * Create a connected bank account
     */
    .post('/', zValidator('json', connectedBankAccountSchemas.create.endpoint.json), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                connectedBankAccountServices.create({
                    userId,
                    data: validatedInput.json,
                })
            )
    )

    /**
     * Update a connected bank account
     */
    .patch(
        '/:id',
        zValidator('param', connectedBankAccountSchemas.updateById.endpoint.param),
        zValidator('json', connectedBankAccountSchemas.updateById.endpoint.json),
        async (c) =>
            routeHandler(c)
                .withUser()
                .handle(async ({ userId, validatedInput }) =>
                    connectedBankAccountServices.updateById({
                        ids: { id: validatedInput.param.id },
                        userId,
                        data: validatedInput.json,
                    })
                )
    );

export default app;
