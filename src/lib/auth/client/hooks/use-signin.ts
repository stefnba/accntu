'use client';

import { useAuthEndpoints } from '@/lib/auth/client/api';
import { authClient } from '@/lib/auth/client/client';
import { useAuthStore } from '@/lib/auth/client/store';
import { LOGIN_REDIRECT_URL } from '@/lib/routes';
import { useRouter } from 'next/navigation';

/**
 * Hook for social authentication
 */
const useSocialSignIn = () => {
    // only github and google are supported for now
    type TProvider = 'github' | 'google';

    const initSignIn = useAuthStore((state) => state.initSignIn);

    const { mutate, isPending, ...rest } = useAuthEndpoints.signInSocial({
        onSuccess: (data) => {
            if ('url' in data) {
                window.location.href = data.url;
            }
        },
    });

    return (provider: TProvider) => {
        initSignIn();
        mutate({
            json: {
                provider,
            },
        });
    };
};

/**
 * OTP validation utilities
 */
export const useEmailOTPAuth = () => {
    const router = useRouter();
    const initSignIn = useAuthStore((state) => state.initSignIn);
    const resetLoading = useAuthStore((state) => state.resetLoading);

    /**
     * Initialize email OTP sign-in process
     * @returns Function to initiate email OTP sign-in
     */
    const initiateEmailOTP = () => {
        const { mutate } = useAuthEndpoints.sendVerificationOTP();

        return (email: string) => {
            initSignIn();
            mutate(
                {
                    json: {
                        email,
                        type: 'sign-in',
                    },
                },
                {
                    onSuccess: () => {
                        resetLoading();
                        router.push('/auth/verify-otp');
                    },
                }
            );
        };
    };

    /**
     * Verify email OTP for sign-in
     * @returns Function to verify email OTP
     */
    const verifyEmailOTP = () => {
        const { mutate } = useAuthEndpoints.signInEmailOTP();

        return (email: string, otp: string) => {
            initSignIn();
            mutate(
                {
                    json: {
                        email,
                        otp,
                    },
                },
                {
                    onSuccess: () => {
                        router.push(LOGIN_REDIRECT_URL);

                        router.refresh();
                    },
                }
            );
        };
    };

    return {
        initiate: initiateEmailOTP(),
        verify: verifyEmailOTP(),
    };
};

/**
 * Sign in hook
 */
export const useSignIn = () => {
    const signInEmail = authClient.signIn.email;
    const signInSocial = useSocialSignIn();
    const router = useRouter();
    const initSignIn = useAuthStore((state) => state.initSignIn);

    const signIn = async ({ email, password }: { email: string; password: string }) => {
        initSignIn();
        await signInEmail({
            email,
            password,
        }).then(() => {
            router.push(LOGIN_REDIRECT_URL);
            router.refresh();
        });
    };

    return {
        email: signIn,
        social: signInSocial,
        emailOTP: useEmailOTPAuth(),
    };
};
