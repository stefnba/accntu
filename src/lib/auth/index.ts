export {
    // authEndpoints,
    authMiddleware,
    getSession,
    getUser,
    validateSession,
} from '@/lib/auth/server';

export type { TSession, TUser } from '@/lib/auth/client/client';
export type { TSocialProvider } from '@/lib/auth/client/types';
