'use client';

import { useAuthEndpoints } from '@/features/auth/api';
import { SocialProvider } from '@/features/auth/schemas';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export type User = {
    id: string;
    email: string;
    name?: string;
};

export type Session = {
    id: string;
    expiresAt: Date;
};

// Define auth context type
type AuthContextType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    loginWithEmail: (email: string) => Promise<void>;
    signupWithEmail: (email: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithSocial: (provider: SocialProvider) => Promise<void>;
    authMethod: SocialProvider | 'email' | undefined;
};

// Create context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
type AuthProviderProps = {
    children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [authMethod, setAuthMethod] = useState<SocialProvider | 'email'>();

    // Auth endpoints
    const { data: userMe, isLoading: isLoadingUser } = useAuthEndpoints.me({});
    const { mutate: logoutMutate } = useAuthEndpoints.logout({});
    const { mutate: loginWithEmailMutate } = useAuthEndpoints.loginWithEmail({});
    const { mutate: signupWithEmailMutate } = useAuthEndpoints.signupWithEmail({});
    const { mutate: loginWithGithubMutate } = useAuthEndpoints.loginWithSocial('github');
    const { mutate: loginWithGoogleMutate } = useAuthEndpoints.loginWithSocial('google');

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Fetch the current user from the Hono API endpoint
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData.user);
                }
            } catch (error) {
                console.error('Failed to restore auth state:', error);
            } finally {
                setIsLoading(false);
            }
        };

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
                    setUser(data.user);
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
                    setUser(data.user);
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
    const loginWithSocial = useCallback(async (provider: SocialProvider) => {
        setIsLoading(true);
        setAuthMethod(provider);

        if (provider === 'github') {
            loginWithGithubMutate(
                {},
                {
                    onSettled: () => {
                        setIsLoading(false);
                        setAuthMethod(undefined);
                    },
                }
            );
        } else if (provider === 'google') {
            loginWithGoogleMutate(
                {},
                {
                    onSettled: () => {
                        setIsLoading(false);
                        setAuthMethod(undefined);
                    },
                }
            );
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
            loginWithSocial,
            session,
        }),
        [user, session, authMethod]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
