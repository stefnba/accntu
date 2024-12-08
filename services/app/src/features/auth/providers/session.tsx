'use client';

import { UserPublicSchema } from '@/features/user/schema/get-user';
import { createContext, useEffect, useState } from 'react';

import { SessionValidationResult } from '../server/actions/session';
import { SESSION_USER } from '../server/config';

/**
 * Helper function to get value of a cookie within React client component.
 * @param cookieKey name of cookue.
 * @returns value of cookie.
 */
const getCookieValue = (cookieKey: string) => {
    if (typeof document === 'undefined') return null; // Ensure it's client-side
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((row) => row.startsWith(`${cookieKey}=`));
    return cookie ? cookie.split('=')[1] : null;
};

/**
 * Retrieves and parsed with zod public user data.
 * @returns Public user data.
 */
const getSessionUserDataFromCookie = () => {
    const rawValue = JSON.parse(
        decodeURIComponent(getCookieValue(SESSION_USER.COOKIE_NAME) || '{}')
    );

    const parsed = UserPublicSchema.safeParse(rawValue);

    if (parsed.error) {
        return null;
    }
    return parsed.data;
};

interface Props {
    children: React.ReactNode;
    sessionUser: SessionValidationResult['user'];
}

export const SessionContext = createContext<SessionValidationResult['user']>(
    {} as SessionValidationResult['user']
);

export const SessionUserProvider = ({ children, sessionUser }: Props) => {
    const [userSession, setUserSession] =
        useState<SessionValidationResult['user']>(sessionUser);

    useEffect(() => {
        const handleCookieChange = () => {
            setUserSession(getSessionUserDataFromCookie());
        };

        window.addEventListener('user:updated', handleCookieChange);
        return () =>
            window.removeEventListener('user:updated', handleCookieChange);
    }, []);

    return (
        <SessionContext.Provider value={userSession}>
            {children}
        </SessionContext.Provider>
    );
};
