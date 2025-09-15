'use client';

import { useAuthLoadingStore } from '@/lib/auth/client/session';
import { useSession } from './session';
import { useSignIn } from './sign-in';
import { useSignOut } from './sign-out';

/**
 * Global auth state hook (minimal re-renders)
 */
export function useAuth() {
    const { user, isAuthenticated, refetchSession } = useSession();
    const { isAuthLoading, isSigningIn, signingInMethod, isSigningOut } = useAuthLoadingStore();
    const { signOut } = useSignOut();
    const { initiateEmailOTP, verifyEmailOTP, signInSocial } = useSignIn();

    return {
        user,
        isAuthenticated,
        isLoading: isAuthLoading,
        // Sign out
        isSigningOut,
        signOut,
        refetchSession,
        // Sign in
        initiateEmailOTP,
        verifyEmailOTP,
        signInSocial,
        isSigningIn,
        signingInMethod,
    };
}
