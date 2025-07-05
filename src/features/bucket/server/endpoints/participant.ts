import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

import { bucketParticipantServiceSchemas } from '@/features/bucket/schemas';
import { participantService } from '@/features/bucket/server/services/participant';
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
            const bucketParticipant = await participantService.getById({ id, userId: user.id });
            return bucketParticipant;
        })
    )
    .post('/', zValidator('json', bucketParticipantServiceSchemas.create), (c) =>
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
    .patch('/:id', zValidator('json', bucketParticipantServiceSchemas.update), (c) =>
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
