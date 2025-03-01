'use client';

import { useAuthEndpoints } from '@/features/auth/api';
import { SocialProvider } from '@/features/auth/schemas';
import { Session, User } from '@/server/features/auth/schemas';
import { useRouter } from 'next/navigation';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

// Define auth context type
type AuthContextType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    loginWithEmail: (email: string) => Promise<void>;
    signupWithEmail: (email: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithOauth: (provider: SocialProvider) => Promise<void>;
    verifyOauth: (provider: SocialProvider) => Promise<void>;
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
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [authMethod, setAuthMethod] = useState<SocialProvider | 'email'>();

    // Auth endpoints
    const { data: userMe, isLoading: isLoadingUser } = useAuthEndpoints.me({});
    const { mutate: logoutMutate } = useAuthEndpoints.logout({});
    const { mutate: loginWithEmailMutate } = useAuthEndpoints.loginWithEmail();
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
                    // todo: forward to verify-otp
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
                onSuccess: (data) => {
                    // todo: forward to verify-otp
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

    const verifyOauth = useCallback(async (provider: SocialProvider) => {
        if (provider === 'github') {
            // todo: verify github auth
        } else if (provider === 'google') {
            // todo: verify google auth
        }
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: !!user && !!session,
            loginWithEmail,
            authMethod,
            signupWithEmail,
            logout,
            loginWithOauth,
            verifyOauth,
            session,
        }),
        [user, session, authMethod]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
