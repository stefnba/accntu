import { db, schema as dbSchema } from '@/db';
import { UserRole } from '@prisma/client';
import { Lucia } from 'lucia';

import { AUTH_COOKIE_NAME } from './config';
import { CustomDrizzlePostgreSQLAdapter } from './lucia-adapter';

const adapter = new CustomDrizzlePostgreSQLAdapter(
    db,
    dbSchema.session,
    dbSchema.user
);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
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
    role: UserRole | null;
    emailVerifiedAt: Date | null;
    settings: {
        language: string | null;
        apparance: string | null;
        timezone: string | null;
    };
}
