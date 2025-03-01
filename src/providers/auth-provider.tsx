'use client';

import { useAuthEndpoints } from '@/features/auth/api';
import { createContext, useCallback, useEffect, useState } from 'react';

// Define user type
export type User = {
    id: string;
    email: string;
    name?: string;
};

// Define auth context type
type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string) => Promise<void>;
    signup: (email: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
};

// Create context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
type AuthProviderProps = {
    children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { data: userMe, isLoading: isLoadingUser } = useAuthEndpoints.me({});
    const { mutate: logoutMutate } = useAuthEndpoints.logout({});
    const { mutate: loginMutate } = useAuthEndpoints.login({});
    const { mutate: signupMutate } = useAuthEndpoints.signup({});

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
    const login = useCallback(async (email: string, password?: string) => {
        setIsLoading(true);

        loginMutate(
            {
                json: {
                    email,
                    password,
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
                },
            }
        );
    }, []);

    // Signup function
    const signup = useCallback(async (email: string, name: string, password?: string) => {
        setIsLoading(true);
        try {
            // Call the signup API endpoint
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, name, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Signup failed');
            }

            const data = await response.json();
            setUser(data.user);
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            // Call the logout API endpoint
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Logout failed');
            }

            // Clear the user from state
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
