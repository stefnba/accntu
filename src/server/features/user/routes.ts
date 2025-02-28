import { db } from '@/server/db';
import { InsertUserSchema, UpdateUserSchema, user } from '@/server/db/schemas/user';
import { createUser, getUser, updateUser } from '@/server/features/user/services';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .post('/', zValidator('json', InsertUserSchema), async (c) => {
        try {
            const data = c.req.valid('json');
            const createdUser = await createUser(data);
            return c.json(
                {
                    status: 'Created',
                    data: createdUser,
                },
                201
            );
        } catch (error) {
            console.error('Error creating user:', error);
            return c.json({ error: 'Failed to create user', message: 'hi', test: 123 }, 400);
        }
    })
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
        try {
            const { id } = c.req.valid('param');
            const userData = await getUser(id);

            if (!userData) {
                return c.json({ error: 'User not found' }, 404);
            }

            return c.json(userData, 200);
        } catch (error) {
            console.error('Error fetching user:', error);
            return c.json({ error: 'Failed to fetch user' }, 500);
        }
    })
    .get('/', async (c) => {
        try {
            const users = await db.select().from(user).limit(100);
            return c.json(users, 200);
        } catch (error) {
            console.error('Error fetching users:', error);
            return c.json({ error: 'Failed to fetch users' }, 500);
        }
    })
    .patch(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', UpdateUserSchema),
        async (c) => {
            try {
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                const updatedUser = await updateUser(id, data);

                if (!updatedUser) {
                    return c.json({ error: 'User not found' }, 404);
                }

                return c.json(updatedUser, 200);
            } catch (error) {
                console.error('Error updating user:', error);
                return c.json({ error: 'Failed to update user' }, 500);
            }
        }
    );

export default app;
