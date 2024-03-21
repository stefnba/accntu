import { cookies } from 'next/headers';

import client from '@/db';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { UserRole } from '@prisma/client';
import { Lucia } from 'lucia';

import { AUTH_COOKIE_NAME } from './config';
import { DEFAULT_LOGIN_REDIRECT } from './routes';

const adapter = new PrismaAdapter(client.session, client.user);

const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === 'production'
        },
        name: AUTH_COOKIE_NAME
    },
    getUserAttributes: (attributes) => {
        const { email, image, firstName, lastName, role, emailVerifiedAt } =
            attributes;

        return {
            email,
            image,
            firstName,
            lastName,
            role,
            emailVerifiedAt
        };
    }
});

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

export default lucia;

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

export interface DatabaseUserAttributes {
    email: string;
    lastName?: string;
    firstName?: string;
    image?: string;
    role?: UserRole;
    emailVerifiedAt?: boolean;
    id: string;
}
