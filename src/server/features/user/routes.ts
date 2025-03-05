import { UpdateUserSchema } from '@/server/db/schemas/user';
import { requireAuth } from '@/server/features/auth/middleware';
import { getUserProfile, updateUserProfile } from '@/server/features/user/services';
import { errorFactory } from '@/server/lib/error';

import { withMutationRoute, withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

// Create a new Hono app for user routes
const app = new Hono()
    // Apply auth middleware to all routes
    .use('*', requireAuth)

    // Update user profile
    .patch('/update', zValidator('json', UpdateUserSchema), async (c) =>
        withMutationRoute(c, async () => {
            const data = c.req.valid('json');
            const user = c.get('user');

            const updatedUser = await updateUserProfile({
                userId: user.id,
                data,
            });

            if (!updatedUser) {
                throw errorFactory.createApiError({
                    message: 'User not found',
                    code: 'AUTH.USER_NOT_FOUND',
                    statusCode: 404,
                });
            }

            return updatedUser;
        })
    )

    // Get current user profile
    .get('/me', async (c) =>
        withRoute(c, async () => {
            const user = c.get('user');
            const userProfile = await getUserProfile({ userId: user.id });
            return userProfile;
        })
    );

export default app;
