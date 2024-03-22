import client from '@/db';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { UserRole } from '@prisma/client';
import { Lucia } from 'lucia';

import { AUTH_COOKIE_NAME } from './config';

const adapter = new PrismaAdapter(client.session, client.user);

export const lucia = new Lucia(adapter, {
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
