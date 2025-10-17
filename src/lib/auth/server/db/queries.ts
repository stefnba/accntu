import { eq } from 'drizzle-orm';

import { db } from '@/server/db';

import { authSession } from '@/lib/auth/server/db/tables';
import { withDbQuery } from '@/server/lib/db';

/**
 * Update the last active timestamp and optionally the IP and user agent for a session
 * @param params - The update parameters
 * @param params.sessionId - The ID of the session
 * @param params.ipAddress - The current IP address (optional)
 * @param params.userAgent - The current user agent (optional)
 */
export const updateSessionActivity = async ({
    sessionId,
    ipAddress,
    userAgent,
}: {
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
}) =>
    withDbQuery({
        operation: 'update session activity',
        queryFn: async () => {
            // Build update object
            const updateData: Record<string, unknown> = {
                lastActiveAt: new Date(),
            };

            // Only include IP/user agent if provided
            if (ipAddress) updateData.ipAddress = ipAddress;
            if (userAgent) updateData.userAgent = userAgent;

            return db.update(authSession).set(updateData).where(eq(authSession.id, sessionId));
        },
    });
