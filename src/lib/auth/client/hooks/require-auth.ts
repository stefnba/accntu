'use client';

import { LOGIN_URL } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import { useSession } from './session';

/**
 * Helper hook for protecting routes
 */
export function useRequireAuth() {
    const { isAuthenticated, isLoading } = useSession();
    const router = useRouter();

    if (!isLoading && !isAuthenticated) {
        router.push(LOGIN_URL);
        return false;
    }

    return isAuthenticated;
}