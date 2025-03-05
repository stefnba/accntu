import { UpdateUserSchema } from '@/server/db/schemas/user';
import { getUserFromContext } from '@/server/features/auth/services/auth';
import { getUserProfile, updateUserProfile } from '@/server/features/user/services';
import { errorFactory } from '@/server/lib/error';

import { zValidator } from '@/server/lib/error/validation';
import { withMutationRoute, withRoute } from '@/server/lib/handler';
import { Hono } from 'hono';

// Create a new Hono app for user routes
const app = new Hono()
    // Apply auth middleware to all routes

    // Update user profile
    .patch('/update', zValidator('json', UpdateUserSchema), async (c) =>
        withMutationRoute(c, async () => {
            const data = c.req.valid('json');
            const user = getUserFromContext(c);

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
            const user = getUserFromContext(c);
            const userProfile = await getUserProfile({ userId: user.id });
            return userProfile;
        })
    );

export default app;
