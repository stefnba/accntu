import { getUser } from '@/server/auth';
import {
    CreateTagSchema,
    GetTagByIdParamSchema,
    GetTagToTransactionSchema,
    GetTagsParamSchema,
    UpdateTagSchema
} from '@features/tag/schema';
import {
    DuplicateTagError,
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

import { createTagExceptions } from './errors';

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
        zValidator('json', UpdateTagSchema),
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
    .delete('/:id', zValidator('param', GetTagByIdParamSchema), async (c) => {
        const { id } = c.req.valid('param');
        const user = getUser(c);

        const data = await deleteTag({ userId: user.id, id });

        return c.json(data, 201);
    })
    .post('/create', zValidator('json', CreateTagSchema), async (c) => {
        const values = c.req.valid('json');
        const user = getUser(c);

        return createTag({
            userId: user.id,
            values
        })
            .then((data) => {
                return c.json(data, 201);
            })
            .catch((e) => {
                if (e instanceof DuplicateTagError) {
                    return createTagExceptions.json(c, 'DUPLICATE');
                }

                return createTagExceptions.json(c, 'FAILURE_TO_CREATE');
            });
    })
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
    .get('/:id', zValidator('param', GetTagByIdParamSchema), async (c) => {
        const { id } = c.req.valid('param');
        const user = getUser(c);

        const data = await getTagById({ userId: user.id, id });

        if (!data) {
            return c.json({ error: 'Not Found' }, 404);
        }

        return c.json(data);
    });

export default app;
