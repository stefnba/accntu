'use client';

import { AUTH_QUERY_KEYS, useAuthEndpoints } from '@/lib/auth/client/api';
import { auth } from '@/lib/auth/config';
import { LOGIN_REDIRECT_URL } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export type TSocialProvider = keyof typeof auth.options.socialProviders;

/**
 * Sign in with email OTP. It provides both the initiate and verify mutations.
 * @important
 * This should not be used in the client. Use useSignIn instead.
 */
const useSignInEmailOTP = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const initiateMutation = useAuthEndpoints.sendVerificationOTP({
        onSuccess: () => {
            // OTP sent successfully - no session update needed
        },
    });

    const verifyMutation = useAuthEndpoints.signInEmailOTP({
        onSuccess: (data) => {
            // Update session cache and redirect on successful OTP verification
            queryClient.setQueryData(AUTH_QUERY_KEYS.SESSION, data);
            router.push(LOGIN_REDIRECT_URL);
            router.refresh();
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
    return useAuthEndpoints.signInSocial({
        onSuccess: (data) => {
            if ('url' in data) {
                // Redirect to social provider OAuth page
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
        signInSocial: (provider: TSocialProvider, callbackURL?: string) =>
            signInSocial.mutate({ json: { provider, callbackURL } }),

        initiateEmailOTP: (email: string) =>
            signInEmailOTP.initiate.mutate({ json: { email, type: 'sign-in' } }),
        verifyEmailOTP: (email: string, otp: string) =>
            signInEmailOTP.verify.mutate({ json: { email, otp } }),
        isSigningIn:
            signInSocial.isPending ||
            signInEmailOTP.initiate.isPending ||
            signInEmailOTP.verify.isPending,
    };
};
