'use client';

import { useCallback } from 'react';
import { useSession } from './session';
import { useSignOut } from './sign-out';
import { useSignIn } from './sign-in';

/**
 * Global auth state hook (minimal re-renders)
 */
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