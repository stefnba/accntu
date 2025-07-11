import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

import { participantServiceSchemas } from '@/features/participant/schemas';
import { participantService } from '@/features/participant/server/services';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { z } from 'zod';

const app = new Hono()
    .get('/', (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const participants = await participantService.getAll({ userId: user.id });
            return participants;
        })
    )
    .get('/:id', zValidator('param', z.object({ id: z.string() })), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.param();
            const participant = await participantService.getById({ id, userId: user.id });
            return participant;
        })
    )
    .post('/', zValidator('json', participantServiceSchemas.create), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const data = c.req.valid('json');
            const newParticipant = await participantService.create({
                data,
                userId: user.id,
            });
            return newParticipant;
        })
    )
    .patch('/:id', zValidator('json', participantServiceSchemas.update), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.param();
            const values = c.req.valid('json');
            const updatedParticipant = await participantService.update({
                id,
                data: values,
                userId: user.id,
            });
            return updatedParticipant;
        })
    )
    .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            return await participantService.remove({ id, userId: user.id });
        })
    );

export default app;