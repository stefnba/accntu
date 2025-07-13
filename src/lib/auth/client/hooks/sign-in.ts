'use client';

import { AUTH_QUERY_KEYS, useAuthEndpoints } from '@/lib/auth/client/api';
import { auth } from '@/lib/auth/config';
import { LOGIN_REDIRECT_URL } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthLoadingStore } from './auth-loading-store';

export type TSocialProvider = keyof typeof auth.options.socialProviders;

/**
 * Sign in with email OTP. It provides both the initiate and verify mutations.
 * @important
 * This should not be used in the client. Use useSignIn instead.
 */
const useSignInEmailOTP = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { setSigningIn, resetAuthLoading } = useAuthLoadingStore();

    const initiateMutation = useAuthEndpoints.sendVerificationOTP({
        onMutate: () => {
            setSigningIn('email-otp');
        },
        onSuccess: () => {
            // OTP sent successfully - navigate to verify page after cookie is set
            router.push('/auth/verify-otp');
            router.refresh();
        },
        onError: () => {
            resetAuthLoading();
        },
    });

    const verifyMutation = useAuthEndpoints.signInEmailOTP({
        onMutate: () => {
            setSigningIn('email-otp');
        },
        onSuccess: (data) => {
            // Update session cache and invalidate to trigger refetch on successful OTP verification
            queryClient.setQueryData(AUTH_QUERY_KEYS.SESSION, data);
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SESSION });
            resetAuthLoading(); // Reset before redirect
            router.push(LOGIN_REDIRECT_URL);
            router.refresh();
        },
        onError: () => {
            resetAuthLoading();
        },
    });

    return {
        initiate: initiateMutation,
        verify: verifyMutation,
    };
};

/**
 * Sign in with social provider
 * @important
 * This should not be used in the client. Use useSignIn instead.
 */
const useSignInSocial = () => {
    const { setSigningIn, resetAuthLoading } = useAuthLoadingStore();

    return useAuthEndpoints.signInSocial({
        onMutate: () => {
            setSigningIn('social');
        },
        onSuccess: (data) => {
            if ('url' in data) {
                // Keep loading state during redirect - will auto-reset on page load
                window.location.href = data.url;
            } else {
                resetAuthLoading();
            }
        },
        onError: () => {
            resetAuthLoading();
        },
    });
};

/**
 * Sign in hook combining all sign in methods
 */
export const useSignIn = () => {
    const signInSocial = useSignInSocial();
    const signInEmailOTP = useSignInEmailOTP();
    const { isSigningIn, signingInMethod } = useAuthLoadingStore();

    return {
        signInSocial: (provider: TSocialProvider, callbackURL?: string) =>
            signInSocial.mutate({ json: { provider, callbackURL } }),

        initiateEmailOTP: (email: string) =>
            signInEmailOTP.initiate.mutate({ json: { email, type: 'sign-in' } }),
        verifyEmailOTP: (email: string, otp: string) =>
            signInEmailOTP.verify.mutate({ json: { email, otp } }),

        // Use global loading state instead of individual mutation states
        isSigningIn,
        signingInMethod,
    };
};
