import { db } from '@db';
import { session, user, userSetting } from '@db/schema';
import type { Session } from '@features/auth/schema/get-session';
import type { User } from '@features/user/schema/get-user';
import { sha256 } from '@oslojs/crypto/sha2';
import {
    encodeBase32LowerCaseNoPadding,
    encodeHexLowerCase
} from '@oslojs/encoding';
import { getTableColumns } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

import { SESSION_COOKIE } from '../config';

export type SessionWithUser = { session: Session; user: User };

export type SessionValidationResult =
    | SessionWithUser
    | { session: null; user: null };

const { userId, ...userSettingCols } = getTableColumns(userSetting);

/**
 * Generate a random session identifier token.
 * @returns session token.
 */
export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}

/**
 * Hashes plan session token for storage.
 * @param token
 * @returns
 */
const hashSessionToken = (token: string): string => {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
};

/**
 * Create a new session with specified expiration, save information in database and return session info.
 * Session tokens are hashed before storage.
 * @param token
 * @param userId
 * @returns session info.
 */
export async function createSession(
    token: string,
    userId: string
): Promise<Session> {
    // session tokens are hashed before storage
    const sessionId = hashSessionToken(token);

    const [newSession] = await db
        .insert(session)
        .values({
            id: sessionId,
            userId,
            expiresAt: new Date(Date.now() + 1000 * SESSION_COOKIE.EXPIRATION)
        })
        .returning();

    if (!newSession) {
        throw new Error("Session couldn't be created.");
    }

    return newSession;
}

/**
 * Sessions are validated in 2 steps:
 * - Does the session exist in your database?
 * - Is it still within expiration?
 *
 * We'll also extend the session expiration when it's close to expiration.
 * This ensures active sessions are persisted, while inactive ones will eventually expire.
 * We'll handle this by checking if there's less than 15 days (half of the 30 day expiration) before expiration.
 * For convenience, we'll return both the session and user object tied to the session ID.
 *
 * Session tokens in db are hashed for storage, so the provided token also needs to be hashed before comparison.
 * @param token
 * @returns
 */
export async function validateSessionToken(
    token: string
): Promise<SessionValidationResult> {
    const sessionId = hashSessionToken(token);

    // query session by id and return user and userSettings too in order to
    // return all required user info in one query
    const [sessionResult] = await db
        .select({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
                role: user.role
            },
            session: session,
            userSetting: userSettingCols
        })
        .from(session)
        .innerJoin(user, eq(session.userId, user.id))
        .innerJoin(userSetting, eq(userSetting.userId, user.id))
        .where(eq(session.id, sessionId));

    // no session record found
    if (!sessionResult) {
        return { session: null, user: null };
    }

    // session already expired
    if (Date.now() >= sessionResult.session.expiresAt.getTime()) {
        await db
            .delete(session)
            .where(eq(session.id, sessionResult.session.id));
        return { session: null, user: null };
    }

    // extend the session expiration when it's close to expiration.
    // we'll handle this by checking if there's less than 15 days before expiration.
    if (
        Date.now() >=
        sessionResult.session.expiresAt.getTime() -
            1000 * SESSION_COOKIE.REFRESH
    ) {
        sessionResult.session.expiresAt = new Date(
            Date.now() + 1000 * SESSION_COOKIE.EXPIRATION
        );
        await db
            .update(session)
            .set({
                expiresAt: sessionResult.session.expiresAt
            })
            .where(eq(session.id, sessionResult.session.id));
    }

    // token is valid
    return {
        session: sessionResult.session,
        user: { ...sessionResult.user, settings: sessionResult.userSetting }
    };
}

/**
 * Invaidate a session by token.
 * Removes record from db table.
 * @param sessionToken session token as stored in cookie.
 */
export async function invalidateSession(sessionToken: string): Promise<void> {
    await db
        .delete(session)
        .where(eq(session.id, hashSessionToken(sessionToken)));
}
