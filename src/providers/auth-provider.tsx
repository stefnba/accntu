'use client';

import { useAuthEndpoints } from '@/features/auth/api';
import { SocialProvider } from '@/features/auth/schemas';
import { TUser } from '@/server/db/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { LOGIN_REDIRECT_URL, LOGIN_URL } from '@/lib/config';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

type TAuthState = 'loggedIn' | 'loggedOut' | 'loading';

// Define auth context type
type AuthContextType = {
    user: TUser | null;
    status: TAuthState;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
    initiateLoginWithEmailOTP: (email: string) => Promise<void>;
    verifyLoginWithEmailOTP: (code: string) => Promise<void>;
    signupWithEmail: (email: string, name: string) => Promise<void>;
    initiateLoginWithOauth: (provider: SocialProvider) => Promise<void>;
    verifyOauthCallback: (
        provider: SocialProvider,
        code: string,
        state?: string | null
    ) => Promise<void>;
    authMethod: SocialProvider | 'email' | undefined;
};

// Create context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
type AuthProviderProps = {
    children: React.ReactNode;
    initialSession?: {
        user: TUser | null;
        sessionId?: string;
    } | null;
};

export function AuthProvider({ children, initialSession = null }: AuthProviderProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Only keep the necessary state
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [authStatus, setAuthStatus] = useState<TAuthState>('loggedOut');
    const [authMethod, setAuthMethod] = useState<SocialProvider | 'email'>();

    // Auth endpoints with refetch interval for user profile
    const {
        data: userMe,
        refetch: refetchUser,
        error: userMeError,
        isLoading: isUserLoading,
        isFetching: isUserFetching,
    } = useAuthEndpoints.me(
        {},
        {
            // Set initial data from initialSession if available
            initialData: initialSession?.user || undefined,
            // Only enable the query if we're mounted and not logged out
            enabled: isMounted && authStatus === 'loggedIn',
            // Refetch every 5 minutes to check if still logged in
            refetchInterval: 1000 * 60 * 5,
            // Refetch in the background if the window is not focused
            refetchIntervalInBackground: true,
            // Retry 3 times if the query fails
            retry: 3,
            // Don't refetch on window focus (we already have refetchInterval)
            refetchOnWindowFocus: false,
        }
    );
    const { mutate: logoutMutate } = useAuthEndpoints.logout({});
    const { mutate: loginWithEmailMutate } = useAuthEndpoints.requestOtp();
    const { mutateAsync: verifyEmailLoginMutate } = useAuthEndpoints.verifyOtp();
    const { mutate: signupWithEmailMutate } = useAuthEndpoints.signupWithEmail();
    const { mutate: loginWithOauthMutate } = useAuthEndpoints.initiateLoginWithOauth();

    // Check if user is logged in on mount - only if no initialSession
    useEffect(() => {
        const checkAuthStatus = async () => {
            if (initialSession) {
                // Already have session data from the server
                return;
            }

            try {
                await refetchUser();
            } catch (error) {
                console.error('Failed to check auth status:', error);
            }
        };

        setIsMounted(true);
        checkAuthStatus();
    }, [initialSession, refetchUser]);

    // Handle session expiration
    useEffect(() => {
        // If we get an error from the user profile query and we had a user before,
        // it likely means the session expired or was invalidated
        if (userMeError && userMe) {
            // Show a notification to the user
            toast.error('Your session has expired. Please log in again.');

            // Logout the user
            logout();
        }
    }, [userMeError, userMe, router]);

    // Update the auth status when the user profile is fetched
    useEffect(() => {
        if (!userMe) {
            setAuthStatus('loggedOut');
        }

        if (userMe) {
            setAuthStatus('loggedIn');
        }
    }, [userMe]);

    // Login function

    /**
     * Login with email OTP
     * @param email - The email to login with
     */
    const initiateLoginWithEmailOTP = useCallback(
        async (email: string) => {
            setAuthMethod('email');

            loginWithEmailMutate(
                {
                    json: {
                        email,
                    },
                },
                {
                    onSuccess: (data) => {
                        // forward to verify-otp
                        router.push('/auth/verify-otp');
                    },
                    onError: (error) => {
                        console.error('Login failed:', error);
                    },
                    onSettled: () => {
                        setAuthMethod(undefined);
                    },
                }
            );
        },
        [loginWithEmailMutate, router]
    );

    /**
     * Signup with email
     * @param email - The email to signup with
     * @param name - The name to signup with
     */
    const signupWithEmail = useCallback(
        async (email: string, name: string) => {
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
                        setAuthMethod(undefined);
                    },
                }
            );
        },
        [signupWithEmailMutate, router]
    );

    /**
     * Logout function
     */
    const logout = useCallback(() => {
        const handleLogout = () => {
            // Set logged out state to disable the query
            setAuthStatus('loggedOut');
            // Clear the user query from cache
            // https://tanstack.com/query/latest/docs/reference/QueryClient/#queryclientinvalidatequeries
            queryClient.removeQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['user'], refetchType: 'none' });
            // Redirect to login page
            router.push(LOGIN_URL);
        };

        logoutMutate(
            {},
            {
                onSettled: () => {
                    handleLogout();
                },
                onError: () => {
                    // Even if the API call fails, we should still log out the user locally
                    handleLogout();
                },
            }
        );
    }, [logoutMutate, router, queryClient]);

    /**
     * Generic social login function
     * @param provider - The provider to login with
     */
    const initiateLoginWithOauth = useCallback(async (provider: SocialProvider) => {
        setAuthMethod(provider);

        loginWithOauthMutate(
            {
                param: {
                    provider,
                },
            },
            {
                onSuccess: (data) => {
                    // forward to github auth page
                    // window.location.href = data.url;
                },
                onSettled: () => {
                    setAuthMethod(undefined);
                },
            }
        );
    }, []);

    /**
     * Verify OAuth callback
     * @param provider - The provider to verify the callback with
     * @param code - The code to verify the callback with
     * @param state - The state to verify the callback with
     */
    const verifyOauthCallback = useCallback(
        async (provider: SocialProvider, code: string, state?: string | null) => {
            // forward to github auth page
            // window.location.href = data.url;
        },
        []
    );

    /**
     * Verify login with email OTP
     * @param code - The code to verify the login with
     */
    const verifyLoginWithEmailOTP = useCallback(async (code: string) => {
        return verifyEmailLoginMutate(
            {
                json: { code },
            },
            {
                onSettled: () => {
                    finalizeLogin();
                },
            }
        )
            .then(({ data }) => {
                // Set user
                router.push('/dashboard');
            })
            .catch((error) => {
                console.log('Here, Verify OTP failed:', error);
                return Promise.reject({
                    message: 'Verify OTP failed',
                    error,
                });
            });
    }, []);

    /**
     * Finalize login
     */
    const finalizeLogin = useCallback(async () => {
        return refetchUser().then(() => {
            router.push(LOGIN_REDIRECT_URL);
        });
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo<AuthContextType>(
        () => ({
            user: userMe ?? null,
            isLoading: isUserLoading || isUserFetching,
            isAuthenticated: !!userMe,
            initiateLoginWithEmailOTP,
            verifyLoginWithEmailOTP,
            authMethod,
            signupWithEmail,
            logout,
            initiateLoginWithOauth,
            verifyOauthCallback,
            status: isUserLoading || isUserFetching ? 'loading' : authStatus,
        }),
        [
            userMe,
            isUserLoading,
            isUserFetching,
            authMethod,
            initiateLoginWithEmailOTP,
            verifyLoginWithEmailOTP,
            signupWithEmail,
            logout,
            initiateLoginWithOauth,
            verifyOauthCallback,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
