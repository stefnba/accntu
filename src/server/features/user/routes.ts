import { UpdateUserSchema } from '@/server/db/schemas/user';
import { requireAuth } from '@/server/features/auth/middleware';
import { updateUser } from '@/server/features/user/services';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

// Create a new Hono app for user routes
const app = new Hono()
    // Apply auth middleware to all routes
    .use('*', requireAuth)

    // Update user profile
    .patch('/update', zValidator('json', UpdateUserSchema), async (c) => {
        try {
            const data = c.req.valid('json');
            const user = c.get('user');
            const updatedUser = await updateUser(user.id, data);

            if (!updatedUser) {
                return c.json({ error: 'User not found' }, 404);
            }

            return c.json(updatedUser, 200);
        } catch (error) {
            console.error('Error updating user:', error);
            return c.json({ error: 'Failed to update user' }, 500);
        }
    })

    // Get current user profile
    .get('/me', async (c) => {
        try {
            const user = c.get('user');
            return c.json(user, 200);
        } catch (error) {
            console.error('Error fetching user:', error);
            return c.json({ error: 'Failed to fetch user' }, 500);
        }
    });

export default app;
