import { cookies } from 'next/headers';

import { lucia } from './lucia';
import { DEFAULT_LOGIN_REDIRECT } from './routes';

/**
 * Create a session and set the session cookie.
 */
export const createSession = async (userId: string): Promise<void> => {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
};

/**
 * Create a session, set the session cookie, and redirect to the default route after login.
 */
export const createSessionAndRedirect = async (
    userId: string
): Promise<Response> => {
    await createSession(userId);
    return new Response(null, {
        status: 302,
        headers: {
            Location: DEFAULT_LOGIN_REDIRECT
        }
    });
};
