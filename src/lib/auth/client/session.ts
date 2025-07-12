'use client';

import { apiClient } from '@/lib/api';
import { AUTH_QUERY_KEYS, useAuthEndpoints } from '@/lib/auth/client/api';
import { LOGIN_URL } from '@/lib/routes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Main session hook using React Query to fetch and manage the session data
 */
export function useSession() {
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

            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Background refresh every 10 minutes
        refetchOnWindowFocus: true, // Refresh when user returns to tab
        retry: (failureCount, error: Error) => {
            // Don't retry on 401 (unauthorized)
            if (error?.message?.includes('401')) return false;
            return failureCount < 2;
        },
    });

    // Derived state
    const isAuthenticated = !!session?.user;
    const user = session?.user || null;

    return {
        session,
        user,
        isAuthenticated,
        isLoading,
        error,
        refetch,
    };
}

/**
 * Sign out mutation with cache invalidation
 */
export function useSignOut() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const signOutMutation = useAuthEndpoints.signOut({
        onSuccess: () => {
            // Clear all auth-related cache
            queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.SESSION });
            queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.ACTIVE_SESSIONS });

            // Redirect to login
            router.push(LOGIN_URL);
            router.refresh(); // Force page refresh to clear any server state
        },
        onError: (error) => {
            console.error('Sign out failed:', error);
            // Even if API fails, clear local cache and redirect
            queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.SESSION });
            router.push(LOGIN_URL);
        },
    });

    return signOutMutation;
}

/**
 * Sign in with email OTP
 */
const useSignInEmailOTP = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const initiateMutation = useAuthEndpoints.sendVerificationOTP({
        onSuccess: (data) => {},
    });

    const verifyMutation = useAuthEndpoints.signInEmailOTP({
        onSuccess: (data) => {},
    });

    return {
        initiate: initiateMutation,
        verify: verifyMutation,
    };
};

/**
 * Sign in with social provider
 */
const useSignInSocial = () => {
    return useAuthEndpoints.signInSocial({
        onSuccess: (data) => {
            if ('url' in data) {
                window.location.href = data.url;
            }
        },
    });
};

/**
 * Sign in hook combining all sign in methods
 */
export const useSignIn = () => {
    const signInSocial = useSignInSocial();

    const signInEmailOTP = useSignInEmailOTP();

    return {
        signInSocial: (provider: 'github' | 'google', callbackURL?: string) =>
            signInSocial.mutate({ json: { provider, callbackURL } }),

        initiateInEmailOTP: (email: string) =>
            signInEmailOTP.initiate.mutate({ json: { email, type: 'sign-in' } }),
        verifyInEmailOTP: (email: string, otp: string) =>
            signInEmailOTP.verify.mutate({ json: { email, otp } }),
        isSigningIn:
            signInSocial.isPending ||
            signInEmailOTP.initiate.isPending ||
            signInEmailOTP.verify.isPending,
    };
};

// Global auth state hook (minimal re-renders)
export function useAuth() {
    const { user, isAuthenticated, isLoading } = useSession();
    const signOutMutation = useSignOut();
    const signIn = useSignIn();

    const signOut = useCallback(() => {
        signOutMutation.mutate({});
    }, [signOutMutation]);

    return {
        user,
        isAuthenticated,
        isLoading,
        isSigningOut: signOutMutation.isPending,
        signOut,
        ...signIn,
    };
}

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
