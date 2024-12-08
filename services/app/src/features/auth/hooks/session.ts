'use client';

import { SessionContext } from '@features/auth/providers/session';
import { useContext } from 'react';

export const useSessionUser = () => {
    const sessionContext = useContext(SessionContext);

    if (!sessionContext) {
        throw new Error(
            'useSessionUser must be used within a <SessionUserProvider />'
        );
    }

    return {
        user: sessionContext
    };
};
