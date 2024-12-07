import { db } from '@db';
import { UserRoleSchema, session, user } from '@db/schema';
import { AUTH_COOKIE_NAME } from '@features/auth/server/config';
import { Lucia } from 'lucia';
import { z } from 'zod';

import { CustomDrizzlePostgreSQLAdapter } from './db-adapter';

const adapter = new CustomDrizzlePostgreSQLAdapter(db, session, user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === 'production'
        },
        name: AUTH_COOKIE_NAME
    },
    getUserAttributes: (attributes) => {
        const {
            email,
            image,
            firstName,
            lastName,
            role,
            emailVerifiedAt,
            settings
        } = attributes;

        return {
            email,
            image,
            firstName,
            lastName,
            role,
            emailVerifiedAt,
            settings
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
    lastName: string | null;
    firstName: string | null;
    image: string | null;
    role: z.infer<typeof UserRoleSchema> | null;
    emailVerifiedAt: Date | null;
    settings: {
        language: string | null;
        apparance: string | null;
        timezone: string | null;
    };
}
