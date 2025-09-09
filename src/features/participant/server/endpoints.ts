import { participantSchemas } from '@/features/participant/schemas';
import { participantServices } from '@/features/participant/server/services';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()

    // Get all participants
    .get('/', zValidator('query', participantSchemas.getMany.endpoint.query), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                participantServices.getMany({
                    pagination: {
                        page: validatedInput.query.page,
                        pageSize: validatedInput.query.pageSize,
                    },
                    filters: validatedInput.query,
                    userId: userId,
                })
            )
    )

    // Get participant by ID
    .get('/:id', zValidator('param', participantSchemas.getById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                participantServices.getById({
                    ids: { id: validatedInput.param.id },
                    userId: userId,
                })
            )
    )

    // Create a new participant
    .post('/', zValidator('json', participantSchemas.create.endpoint.json), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                participantServices.create({ data: validatedInput.json, userId: userId })
            )
    )

    // Update a participant by ID
    .patch(
        '/:id',
        zValidator('param', participantSchemas.updateById.endpoint.param),
        zValidator('json', participantSchemas.updateById.endpoint.json),
        (c) =>
            routeHandler(c)
                .withUser()
                .handleMutation(async ({ userId, validatedInput }) =>
                    participantServices.updateById({
                        ids: { id: validatedInput.param.id },
                        data: validatedInput.json,
                        userId: userId,
                    })
                )
    )

    // Delete a participant by ID
    .delete('/:id', zValidator('param', participantSchemas.removeById.endpoint.param), (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                participantServices.removeById({
                    ids: { id: validatedInput.param.id },
                    userId: userId,
                })
            )
    );

export default app;
