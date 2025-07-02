import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

import {
    insertBucketParticipantSchema,
    updateBucketParticipantSchema,
} from '@/features/bucket/server/db/schemas';
import { bucketParticipantServices } from '@/features/bucket/server/services/bucket-participant';
import { getUser } from '@/lib/auth/server';
import { endpointSelectSchema } from '@/lib/schemas';
import { withRoute } from '@/server/lib/handler';

const app = new Hono()
    .get('/:bucketId', (c) =>
        withRoute(c, async () => {
            const { bucketId } = c.req.param();
            const participants = await bucketParticipantServices.getAllForBucket(bucketId);
            return c.json(participants);
        })
    )
    .post('/:bucketId', zValidator('json', insertBucketParticipantSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const data = c.req.valid('json');
            const newParticipant = await bucketParticipantServices.addParticipant(data, user.id);
            return c.json(newParticipant, 201);
        })
    )
    .put(
        '/:id',
        zValidator('param', endpointSelectSchema),
        zValidator('json', updateBucketParticipantSchema),
        (c) =>
            withRoute(c, async () => {
                const user = getUser(c);
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                const updatedParticipant = await bucketParticipantServices.updateParticipant({
                    id,
                    data,
                    userId: user.id,
                });
                return c.json(updatedParticipant);
            })
    )
    .delete('/:id', zValidator('param', endpointSelectSchema), (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            await bucketParticipantServices.removeParticipant(id, user.id);
            return c.json({ success: true });
        })
    );

export const bucketParticipantController = app;
