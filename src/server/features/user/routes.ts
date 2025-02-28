import { db } from '@/server/db';
import { InsertUserSchema, UpdateUserSchema, user } from '@/server/db/schemas/user';
import { createUser, updateUser } from '@/server/features/user/services';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .post('/', zValidator('json', InsertUserSchema), async (c) => {
        const data = c.req.valid('json');
        const createdUser = await createUser(data);
        return c.json(createdUser, 201);
    })
    .get('/:id', zValidator('param', z.object({ id: z.string() })), (c) =>
        c.json({ id: c.req.param('id') })
    )
    .get('/', async (c) => {
        const users = await db.select().from(user);
        return c.json(users, 200);
    })
    .patch(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', UpdateUserSchema),
        async (c) => {
            const { id } = c.req.valid('param');
            const data = c.req.valid('json');
            const updatedUser = await updateUser(id, data);
            if (!updatedUser) {
                return c.json({ message: 'User not found' }, 404);
            }

            return c.json(updatedUser, 201);
        }
    );

export default app;
