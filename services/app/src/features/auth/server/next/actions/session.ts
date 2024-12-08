import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { LOGIN_URL } from '@/lib/auth/routes';
import {
    type SessionWithUser,
    validateSessionToken
} from '@features/auth/server/actions/session';
import { SESSION_COOKIE } from '@features/auth/server/config';
import { cache } from 'react';

/**
 * Retrieve current session object and session user object for Next.js server components.
 */
export const getCurrentSession = cache(async (): Promise<SessionWithUser> => {
    const token = cookies().get(SESSION_COOKIE.COOKIE_NAME)?.value ?? null;
    if (token === null) {
        redirect(LOGIN_URL);
    }
    const { user, session } = await validateSessionToken(token);

    if (!user || !session) {
        redirect(LOGIN_URL);
    }

    return {
        user,
        session
    };
});
