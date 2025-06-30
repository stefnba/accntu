'use client';

import { useSession } from '@/lib/auth/client/hooks/use-session';
import { useSignIn } from '@/lib/auth/client/hooks/use-signin';
import { useSignOut } from '@/lib/auth/client/hooks/use-signout';
import { useAuthStore } from '@/lib/auth/client/store';

/**
 * Main auth hook using composition pattern
 * Provides a unified API for all auth functionality
 */
export const useAuth = () => {
    const authState = useAuthStore((state) => state.authState);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);

    const { session, user } = useSession();
    const { signOut } = useSignOut();
    const signIn = useSignIn();
    return {
        // session
        session,
        user,

        // auth state
        authState,
        isAuthenticated,
        isLoading,

        // actions
        signOut,
        signIn,
    };
};
