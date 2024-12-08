import type { User } from '@/features/user/schema/get-user';
import { getCurrentSession } from '@features/auth/server/next/actions/session';

/**
 * Get the currently authenticated user for Next.js server components.
 * If user is not logged in, getCurrentSession() redirects to login page.
 * @returns User object.
 */
export const getUser = async (): Promise<User> => {
    const { user } = await getCurrentSession();
    return user;
};
