'use client';

import { AUTH_QUERY_KEYS } from '@/lib/auth/client/api';
import { authClient } from '@/lib/auth/client/client';
import { LOGIN_REDIRECT_URL } from '@/lib/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthLoadingStore } from './auth-loading-store';

import type { TSocialProvider } from '@/lib/auth/client/types';

/**
 * Sign in with email OTP using direct better-auth client methods.
 * Provides both the initiate and verify mutations with TanStack Query integration.
 */
const useSignInEmailOTP = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { setSigningIn, resetAuthLoading } = useAuthLoadingStore();

    const initiateMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const result = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: 'sign-in',
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.data;
        },
        onMutate: () => {
            setSigningIn('email-otp');
        },
        onSuccess: () => {
            // OTP sent successfully - navigate to verify page
            router.push('/auth/verify-otp');
            router.refresh();
        },
        onError: () => {
            resetAuthLoading();
        },
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
            const result = await authClient.signIn.emailOtp({
                email,
                otp,
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.data;
        },
        onMutate: () => {
            setSigningIn('email-otp');
        },
        onSuccess: (data) => {
            // Update session cache and invalidate to trigger refetch
            queryClient.setQueryData(AUTH_QUERY_KEYS.SESSION, data);
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SESSION });
            resetAuthLoading();
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
 * Sign in with social provider using direct better-auth client methods.
 */
export const useSignInSocial = () => {
    const { setSigningIn, resetAuthLoading } = useAuthLoadingStore();

    return useMutation({
        mutationFn: async ({
            provider,
            callbackURL,
        }: {
            provider: TSocialProvider;
            callbackURL?: string;
        }) => {
            const result = await authClient.signIn.social({
                provider,
                callbackURL,
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.data;
        },
        onMutate: () => {
            setSigningIn('social');
        },
        onSuccess: (data) => {
            if (data && 'url' in data && data.url) {
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
 * Sign in hook combining all sign in methods with direct better-auth client integration
 */
export const useSignIn = () => {
    const signInSocial = useSignInSocial();
    const signInEmailOTP = useSignInEmailOTP();
    const { isSigningIn, signingInMethod } = useAuthLoadingStore();

    return {
        signInSocial: (provider: TSocialProvider, callbackURL?: string) =>
            signInSocial.mutate({ provider, callbackURL }),

        initiateEmailOTP: (email: string) => signInEmailOTP.initiate.mutate({ email }),
        verifyEmailOTP: (email: string, otp: string) =>
            signInEmailOTP.verify.mutate({ email, otp }),

        // Use global loading state instead of individual mutation states
        isSigningIn,
        signingInMethod,
    };
};

/**
 * Sign in with email password.
 */
export const useSignInEmailPassword = ({ redirect = true } = { redirect: true }) => {
    const { setSigningIn, resetAuthLoading } = useAuthLoadingStore();
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (params: Parameters<typeof authClient.signIn.email>[0]) => {
            const result = await authClient.signIn.email(params);

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.data;
        },
        onMutate: () => {
            setSigningIn('email-password');
        },
        onSuccess: (data) => {
            resetAuthLoading();
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SESSION });
            if (redirect) {
                router.push(LOGIN_REDIRECT_URL);
                router.refresh();
            }
        },
        onSettled: () => {
            resetAuthLoading();
        },
    });
};
