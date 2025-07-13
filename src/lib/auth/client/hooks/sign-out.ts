'use client';

import { AUTH_QUERY_KEYS, useAuthEndpoints } from '@/lib/auth/client/api';
import { LOGIN_URL } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

/**
 * Sign out mutation with cache invalidation
 */
export function useSignOut() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const signOutMutation = useAuthEndpoints.signOut({
        // error or success doesn't matter, we just want to clear the cache and redirect to login
        onSettled: () => {
            // Security-first approach: Clear all cache to prevent data leakage
            // 1. First set session to null to prevent immediate refetch
            queryClient.setQueryData(AUTH_QUERY_KEYS.SESSION, null);
            
            // 2. Then clear all cache after a brief delay to prevent race conditions
            setTimeout(() => {
                queryClient.clear();
            }, 100);

            // Redirect to login
            router.push(LOGIN_URL);
            router.refresh(); // Force page refresh to clear any server state
        },
    });

    return signOutMutation;
}