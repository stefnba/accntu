import {
    GetTagByIdSchema,
    GetTagsSchema,
    TagAndTransactionSchema,
    getTagById,
    getTags,
    removeTagFromTransaction
} from '@/server/actions/tag';
import { getUser } from '@/server/auth';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { InsertTagToTransactionSchema } from '../db/schema';

const app = new Hono()
    .get(
        '/',
        zValidator('query', GetTagsSchema.omit({ userId: true })),
        async (c) => {
            const user = getUser(c);
            const q = c.req.valid('query');

            const data = await getTags({
                userId: user.id,
                ...q
            });
            console.log(data);
            return c.json(data);
        }
    )

    .delete(
        '/:tagId/:transactionId',
        zValidator('param', TagAndTransactionSchema),
        async (c) => {
            const { tagId, transactionId } = c.req.valid('param');
            const user = getUser(c);

            // remove relation
            await removeTagFromTransaction({ tagId, transactionId });

            return c.json({ message: 'Success' });
        }
    )
    .get(
        '/:id',
        zValidator('param', GetTagByIdSchema.omit({ userId: true })),
        async (c) => {
            const { id } = c.req.valid('param');
            const user = getUser(c);

            const data = await getTagById({ userId: user.id, id });

            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }

            return c.json(data);
        }
    );

export default app;
