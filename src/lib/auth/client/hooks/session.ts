'use client';

import { AUTH_QUERY_KEYS } from '@/lib/auth/client/api';
import { authClient } from '@/lib/auth/client/client';
import { TClientSession } from '@/lib/auth/client/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthLoadingStore } from './auth-loading-store';

const RETRY_COUNT = 2; // retry 2 times if the error is not 401
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const REFRESH_INTERVAL = 10 * 60 * 1000; // Background refresh every 10 minutes

/**
 * Main session hook using React Query to fetch and manage the session data
 * We use the better-auth client to get the session and add custom logic to return the client session state.
 */
export const useSession = (): TClientSession => {
    const { resetAuthLoading, isAuthLoading } = useAuthLoadingStore();

    // ====================
    // Query
    // ====================

    const {
        data: session,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: AUTH_QUERY_KEYS.SESSION,
        queryFn: async () => {
            // use better-auth client to get the session
            const response = await authClient.getSession();

            if (response.error) {
                if (response.error.status === 401) return null;
                throw new Error(`Session check failed: ${response.error.message}`);
            }

            return response.data;
        },
        enabled: true,
        staleTime: STALE_TIME,
        refetchInterval: (query) => {
            // Only refetch if we have a valid session
            const sessionData = query.state.data;
            return sessionData?.user && sessionData?.session ? REFRESH_INTERVAL : false;
        },
        refetchOnWindowFocus: (query) => {
            // Only refetch on focus if we have a valid session
            const sessionData = query.state.data;
            return !!(sessionData?.user && sessionData?.session);
        },
        retry: (failureCount: number, error: Error) => {
            // Don't retry on 401 (unauthorized)
            if (error?.message?.includes('401')) return false;
            // retry 2 times if the error is not 401
            return failureCount < RETRY_COUNT;
        },
    });

    // ====================
    // Computed state
    // ====================

    // Derived auth state from session data
    const isAuthenticated = !!session?.user && !!session?.session;

    // Reset auth loading store when authentication succeeds
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            resetAuthLoading();
        }
    }, [isAuthenticated, isLoading, resetAuthLoading]);

    // ====================
    // Return
    // ====================

    // Use React Query loading state, not auth loading store for session checks
    const actualIsLoading = isLoading || isAuthLoading;

    // Return the client session state
    if (!isAuthenticated) {
        // If the user is not authenticated, return the client session state with null values
        return {
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading: actualIsLoading,
            error: null,
            refetchSession: refetch,
        };
    }

    // If the user is authenticated, return the client session state with the session data
    return {
        session: session?.session,
        user: session?.user,
        isAuthenticated,
        isLoading: actualIsLoading,
        error: null,
        refetchSession: refetch,
    };
};
