import { type TSession, type TUser } from '@/lib/auth';
/**
 * Define the auth context type
 */
export interface AuthContext {
    user: TUser | null;
    session: TSession | null;
}
