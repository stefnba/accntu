'use client';

import { apiClient } from '@/lib/api';
import { AUTH_QUERY_KEYS } from '@/lib/auth/client/api';
import { TSession, TUser } from '@/lib/auth/client/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthLoadingStore } from './auth-loading-store';

const RETRY_COUNT = 2; // retry 2 times if the error is not 401
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const REFRESH_INTERVAL = 10 * 60 * 1000; // Background refresh every 10 minutes

export type TClientSession =
    | {
          isAuthenticated: true;
          user: TUser;
          session: TSession;
          isLoading: boolean;
          error: Error | null;
          refetchSession: () => void;
      }
    | {
          isAuthenticated: false;
          user: null;
          session: null;
          isLoading: boolean;
          error: Error | null;
          refetchSession: () => void;
      };

/**
 * Main session hook using React Query to fetch and manage the session data
 * We can't use the useAuthEndpoints.getSession().
 */
export const useSession = (): TClientSession => {
    const { resetAuthLoading } = useAuthLoadingStore();
    
    const {
        data: session,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: AUTH_QUERY_KEYS.SESSION,
        queryFn: async () => {
            const response = await apiClient.auth.sessions.get.$get();

            if (!response.ok) {
                if (response.status === 401) return null;
                throw new Error(`Session check failed: ${response.status}`);
            }

            const data = await response.json();

            return data;
        },
        enabled: (query) => {
            // Disable query if we already know there's no session
            const currentData = query.state.data;
            // Only disable if we explicitly have null (meaning 401 was returned)
            // Allow initial fetch when data is undefined
            return currentData !== null;
        },
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

    // Derived state
    const isAuthenticated = !!session?.user && !!session?.session;

    // Reset auth loading state when authentication succeeds
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            resetAuthLoading();
        }
    }, [isAuthenticated, isLoading, resetAuthLoading]);

    if (!isAuthenticated) {
        return {
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading,
            error: null,
            refetchSession: () => {},
        };
    }

    return {
        session: session?.session,
        user: session?.user,
        isAuthenticated,
        isLoading,
        error,
        refetchSession: refetch,
    };
};