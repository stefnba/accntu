'use client';

import { Session, User } from 'lucia';
import { createContext, useContext } from 'react';

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
    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
};
