import { participantSchemas } from '@/features/participant/schemas';
import { participantServices } from '@/features/participant/server/services';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

const app = new Hono()
    .get('/', zValidator('query', participantSchemas.operations.getMany.endpoint.query), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const query = c.req.valid('query');
            return await participantServices.getMany({
                userId: user.id,
                filters: query,
                pagination: query,
            });
        })
    )
    .get('/:id', zValidator('param', participantSchemas.operations.getById.endpoint.param), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const ids = c.req.valid('param');
            return await participantServices.getById({ ids, userId: user.id });
        })
    )
    .post(
        '/',
        zValidator('json', participantSchemas.operations.create.endpoint.json),
        (c) =>
            withRoute(
                c,
                async () => {
                    const user = getUser(c);
                    const data = c.req.valid('json');
                    return await participantServices.create({
                        data,
                        userId: user.id,
                    });
                },
                201
            )
    )
    .patch(
        '/:id',
        zValidator('param', participantSchemas.operations.updateById.endpoint.param),
        zValidator('json', participantSchemas.operations.updateById.endpoint.json),
        (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const ids = c.req.valid('param');
                const data = c.req.valid('json');
                return await participantServices.updateById({
                    ids,
                    data,
                    userId: user.id,
                });
            })
    )
    .delete(
        '/:id',
        zValidator('param', participantSchemas.operations.removeById.endpoint.param),
        (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const ids = c.req.valid('param');
                return await participantServices.removeById({ ids, userId: user.id });
            })
    );

export default app;