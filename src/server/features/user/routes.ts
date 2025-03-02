import { UpdateUserSchema } from '@/server/db/schemas/user';
import { getUser } from '@/server/features/auth/utils';
import { updateUser } from '@/server/features/user/services';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const app = new Hono()
    .patch(
        '/update',

        zValidator('json', UpdateUserSchema),
        async (c) => {
            try {
                const user = getUser(c);
                console.log(user);
                const data = c.req.valid('json');
                const updatedUser = await updateUser(user.id, data);

                if (!updatedUser) {
                    return c.json({ error: 'User not found' }, 404);
                }

                return c.json(updatedUser, 200);
            } catch (error) {
                console.error('Error updating user:', error);
                return c.json({ error: 'Failed to update user' }, 500);
            }
        }
    )
    .get('/me', async (c) => {
        try {
            const users = {};
            return c.json(users, 200);
        } catch (error) {
            console.error('Error fetching users:', error);
            return c.json({ error: 'Failed to fetch users' }, 500);
        }
    });

export default app;
