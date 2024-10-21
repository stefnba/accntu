import { getUser } from '@/server/auth';
import {
    CreateTagSchema,
    GetTagByIdParamSchema,
    GetTagToTransactionSchema,
    GetTagsParamSchema
} from '@features/tag/schema';
import {
    createTag,
    deleteTag,
    getTagById,
    getTags,
    removeTagFromTransaction,
    updateTag
} from '@features/tag/server/actions/';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get(
        '/',
        zValidator('query', GetTagsParamSchema.omit({ userId: true })),
        async (c) => {
            const user = getUser(c);
            const q = c.req.valid('query');

            const data = await getTags({
                userId: user.id,
                ...q
            });
            return c.json(data);
        }
    )
    .patch(
        '/:id',
        zValidator('json', CreateTagSchema),
        zValidator(
            'param',
            z.object({
                id: z.string()
            })
        ),
        async (c) => {
            const { id } = c.req.valid('param');
            const values = c.req.valid('json');
            const user = getUser(c);

            const data = await updateTag({
                filter: { userId: user.id, id },
                values
            });

            return c.json(data, 201);
        }
    )
    .delete(
        '/:id',
        zValidator(
            'param',
            z.object({
                id: z.string()
            })
        ),
        async (c) => {
            const { id } = c.req.valid('param');
            const user = getUser(c);

            const data = await deleteTag({ userId: user.id, id });

            return c.json(data, 201);
        }
    )
    .post(
        '/create',
        zValidator('json', CreateTagSchema.omit({ userId: true })),
        async (c) => {
            const values = c.req.valid('json');
            const user = getUser(c);

            try {
                const data = await createTag({
                    userId: user.id,
                    ...values
                });
                return c.json(data, 201);
            } catch (e) {
                console.error(e);
                return c.json({ error: 'Failed to create tag' }, 400);
            }
        }
    )
    .delete(
        '/:tagId/:transactionId',
        zValidator('param', GetTagToTransactionSchema),
        async (c) => {
            const { tagId, transactionId } = c.req.valid('param');
            const user = getUser(c); // todo check if user has access to transaction

            // remove relation
            await removeTagFromTransaction({ tagId, transactionId });

            return c.json({ message: 'Success' });
        }
    )
    .get(
        '/:id',
        zValidator('param', GetTagByIdParamSchema.omit({ userId: true })),
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
