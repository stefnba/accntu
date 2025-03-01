'use client';

import { useAuthEndpoints } from '@/features/auth/api';
import { SocialProvider } from '@/features/auth/schemas';
import { Session, User } from '@/server/features/auth/schemas';
import { useRouter } from 'next/navigation';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

// Define auth context type
type AuthContextType = {
    user: User | null;

    isLoading: boolean;
    isAuthenticated: boolean;
    loginWithEmail: (email: string) => Promise<void>;
    signupWithEmail: (email: string, name: string) => Promise<void>;
    verifyOtp: (otp: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithOauth: (provider: SocialProvider) => Promise<void>;
    verifyOauth: (provider: SocialProvider, code: string, state?: string | null) => Promise<void>;
    authMethod: SocialProvider | 'email' | undefined;
};

// Create context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
type AuthProviderProps = {
    children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [authMethod, setAuthMethod] = useState<SocialProvider | 'email'>();

    // Auth endpoints
    const { data: userMe } = useAuthEndpoints.me({});
    const { mutate: logoutMutate } = useAuthEndpoints.logout({});
    const { mutate: loginWithEmailMutate } = useAuthEndpoints.requestOtp();
    const { mutate: verifyEmailLoginMutate } = useAuthEndpoints.verifyOtp();
    const { mutate: signupWithEmailMutate } = useAuthEndpoints.signupWithEmail();
    const { mutate: loginWithGithubMutate } = useAuthEndpoints.loginWithGithub();
    const { mutate: loginWithGoogleMutate } = useAuthEndpoints.loginWithGoogle();

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            // todo: check if user is logged in
        };

        if (userMe) {
            setUser(userMe);
        }

        checkAuthStatus();
    }, []);

    // Login function
    const loginWithEmail = useCallback(async (email: string) => {
        setIsLoading(true);
        setAuthMethod('email');

        loginWithEmailMutate(
            {
                json: {
                    email,
                },
            },
            {
                onSuccess: (data) => {
                    console.log('Login success', data);
                    // forward to verify-otp
                    router.push('/auth/verify-otp');
                },
                onError: (error) => {
                    console.error('Login failed:', error);
                },
                onSettled: () => {
                    setIsLoading(false);
                    setAuthMethod(undefined);
                },
            }
        );
    }, []);

    // Signup function
    const signupWithEmail = useCallback(async (email: string, name: string) => {
        setIsLoading(true);
        setAuthMethod('email');
        signupWithEmailMutate(
            {
                json: { email, name },
            },
            {
                onSuccess: () => {
                    // forward to verify-otp
                    router.push('/auth/verify-otp');
                },
                onError: (error) => {
                    console.error('Signup failed:', error);
                },
                onSettled: () => {
                    setIsLoading(false);
                },
            }
        );
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        setIsLoading(true);

        logoutMutate(
            {},
            {
                onSettled: () => {
                    setIsLoading(false);
                },
            }
        );
    }, []);

    // Generic social login function
    const loginWithOauth = useCallback(async (provider: SocialProvider) => {
        setIsLoading(true);
        setAuthMethod(provider);

        if (provider === 'github') {
            loginWithGithubMutate(
                {
                    param: {
                        provider: 'github',
                    },
                },
                {
                    onSuccess: (data) => {
                        // forward to github auth page
                        window.location.href = data.url;
                    },
                    onSettled: () => {
                        setIsLoading(false);
                        setAuthMethod(undefined);
                    },
                }
            );
        } else if (provider === 'google') {
            loginWithGoogleMutate(
                {
                    param: { provider },
                },
                {
                    onSuccess: (data) => {
                        // forward to google auth page
                        // window.location.href = data.url;
                    },
                    onSettled: () => {
                        setIsLoading(false);
                        setAuthMethod(undefined);
                    },
                }
            );
        }
    }, []);

    const verifyOauth = useCallback(
        async (provider: SocialProvider, code: string, state?: string | null) => {
            setIsLoading(true);
            setAuthMethod(provider);

            try {
                if (provider === 'github') {
                    // Use the verifyGithub endpoint
                    const { mutateAsync: verifyGithubMutate } = useAuthEndpoints.verifyGithub();
                    const response = await verifyGithubMutate({
                        query: { code, state },
                    });

                    // Handle the response safely
                    if (response && typeof response === 'object') {
                        // Type assertion after validation
                        const authResponse = response as { user: User; session: Session };
                        setUser(authResponse.user);

                        router.push('/dashboard');
                    }
                } else if (provider === 'google') {
                    // Use the verifyGoogle endpoint
                    const { mutateAsync: verifyGoogleMutate } = useAuthEndpoints.verifyGoogle();
                    const response = await verifyGoogleMutate({
                        query: { code, state },
                    });

                    // Handle the response safely
                    if (response && typeof response === 'object') {
                        // Type assertion after validation
                        const authResponse = response as { user: User; session: Session };
                        setUser(authResponse.user);

                        router.push('/dashboard');
                    }
                }
            } catch (error) {
                console.error(`${provider} verification failed:`, error);
                router.push(`/login?error=${provider}_verification_failed`);
            } finally {
                setIsLoading(false);
                setAuthMethod(undefined);
            }
        },
        [router]
    );

    const verifyOtp = useCallback(async (code: string) => {
        setIsLoading(true);
        verifyEmailLoginMutate(
            {
                json: { code },
            },
            {
                onSettled: () => {
                    setIsLoading(false);
                },
                onSuccess: (data) => {
                    setUser(data.user);
                    // setSession(data.session);
                    router.push('/dashboard');
                },
            }
        );
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: !!user,
            loginWithEmail,
            authMethod,
            signupWithEmail,
            logout,
            loginWithOauth,
            verifyOauth,
            verifyOtp,
        }),
        [user, authMethod]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
