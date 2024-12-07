'use client';

import { Session, User } from 'lucia';
import { createContext, useEffect, useMemo, useState } from 'react';

import { SESSION_USER } from '../server/config';

const getCookieValue = (key: string) => {
    if (typeof document === 'undefined') return null; // Ensure it's client-side
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((row) => row.startsWith(`${key}=`));
    return cookie ? cookie.split('=')[1] : null;
};

interface SessionProviderProps {
    user: User | null;
    session: Session | null;
}

interface Props {
    children: React.ReactNode;
    session: SessionProviderProps;
}

export const SessionContext = createContext<SessionProviderProps>(
    {} as SessionProviderProps
);

export const SessionProvider = ({ children, session }: Props) => {
    const [userSession, setUserSession] =
        useState<SessionProviderProps>(session);

    useEffect(() => {
        const handleCookieChange = () => {
            setUserSession({
                user: JSON.parse(
                    decodeURIComponent(
                        getCookieValue(SESSION_USER.COOKIE_NAME) || '{}'
                    )
                ) as unknown as User,
                session: getCookieValue(
                    SESSION_USER.COOKIE_NAME
                ) as unknown as Session
            });
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
