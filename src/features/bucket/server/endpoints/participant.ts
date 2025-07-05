import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import {
    insertParticipantSchema,
    updateParticipantSchema,
} from '@/features/bucket/server/db/schemas';
import { participantService } from '@/features/bucket/server/services/bucketParticipant';

import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';

const app = new Hono()
    .get('/', (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const participants = await participantService.getParticipants(user.id);
            return c.json(participants);
        })
    )
    .get('/:id', (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.param();
            const bucketParticipant = await participantService.getParticipantById(id, user.id);
            return c.json(bucketParticipant);
        })
    )
    .post('/', zValidator('json', insertParticipantSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const values = c.req.valid('json');
            const newParticipant = await participantService.createParticipant(values, user.id);
            return c.json(newParticipant, 201);
        })
    )
    .patch('/:id', zValidator('json', updateParticipantSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.param();
            const values = c.req.valid('json');
            const updatedParticipant = await participantService.updateParticipant(
                id,
                values,
                user.id
            );
            return c.json(updatedParticipant);
        })
    )
    .delete('/:id', (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.param();
            const deletedParticipant = await participantService.deleteParticipant(id, user.id);
            return c.json(deletedParticipant);
        })
    );

export const participantEndpoints = app;
