import { UpdateUserSchema } from '@/server/db/schemas/user';
import { sessionServices } from '@/server/features/auth/services';
import { getSessionIdFromContext, getUserFromContext } from '@/server/features/auth/services/auth';
import { getUserProfile, updateUserProfile } from '@/server/features/user/services';
import { getCookieValue } from '@/server/lib/cookies';
import { errorFactory } from '@/server/lib/error';

import { zValidator } from '@/server/lib/error/validation';
import { withMutationRoute, withQueryRoute, withRoute } from '@/server/lib/handler';
import { Hono } from 'hono';
import { z } from 'zod';

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
    )

    // Get active sessions for current user
    .get('/sessions', async (c) =>
        withQueryRoute(c, async () => {
            const user = getUserFromContext(c);
            const currentSessionId = getSessionIdFromContext(c);

            const sessions = await sessionServices.getSessionsByUserId({
                userId: user.id,
                currentSessionId,
            });
            return { sessions };
        })
    )

    // Revoke a specific session
    .delete('/sessions/:sessionId', async (c) =>
        withMutationRoute(c, async () => {
            const user = c.get('user');
            const sessionId = c.req.param('sessionId');
            await sessionServices.revokeSession({ sessionId, userId: user.id });
            return { message: 'Session revoked successfully' };
        })
    )

    // Revoke all sessions except current
    .delete('/sessions', async (c) =>
        withMutationRoute(c, async () => {
            const user = c.get('user');
            const currentSessionId = getCookieValue(c, 'AUTH_SESSION', z.string());
            await sessionServices.revokeAllSessions({
                userId: user.id,
                exceptSessionId: currentSessionId,
            });
            return { message: 'All sessions revoked successfully' };
        })
    );

export default app;
