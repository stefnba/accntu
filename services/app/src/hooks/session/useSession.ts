import { SessionContext } from '@/lib/auth/provider';
import { useContext } from 'react';

export const useSession = () => {
    const sessionContext = useContext(SessionContext);

    if (!sessionContext) {
        throw new Error('useSession must be used within a SessionProvider');
    }

    return sessionContext;
};
