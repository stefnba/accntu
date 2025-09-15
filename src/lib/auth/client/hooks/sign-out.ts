'use client';

import { authClient } from '@/lib/auth/client/client';
import { useAuthLoadingStore } from '@/lib/auth/client/session';
import { LOGIN_URL } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface UseSignOutProps {
    redirectToLogin?: boolean;
}

/**
 * Sign out mutation with cache invalidation
 */
export function useSignOut({ redirectToLogin = true }: UseSignOutProps = {}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setSigningOut, resetAuthLoading, isSigningOut } = useAuthLoadingStore();

    const signOut = useCallback(() => {
        authClient.signOut({
            fetchOptions: {
                onRequest: () => {
                    // set signing out to true
                    setSigningOut();

                    // Security-first approach: Clear all cache to prevent data leakage
                    // 1. First set session to null to prevent immediate refetch
                    const queryCache = queryClient.getQueryCache();
                    // iterate over all queries and set them to null
                    for (const query of queryCache.findAll()) {
                        const queryKey = query.queryKey;
                        queryClient.setQueryData(queryKey, null);
                    }
                },
                // error or success doesn't matter, we just want to clear the cache and redirect to login
                onResponse: () => {
                    // const data = queryClient.getQueryData()

                    // 2. Then clear all cache after a brief delay to prevent race conditions
                    setTimeout(() => {
                        queryClient.clear();
                    }, 500);

                    resetAuthLoading();

                    if (redirectToLogin) {
                        // Redirect to login
                        router.push(LOGIN_URL);
                    }

                    // Force page refresh to clear any server state
                    router.refresh();
                },
            },
        });
    }, [queryClient, router, redirectToLogin, setSigningOut, resetAuthLoading]);

    return { signOut, isSigningOut };
}
