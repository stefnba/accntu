export {
    authEndpoints,
    authMiddleware,
    getSession,
    getUser,
    validateSession,
} from '@/lib/auth/server';

export type { TSession, TUser } from './client';
