import type { TSession, TUser } from '@/lib/auth/client';
import { create } from 'zustand';

type TSessionCombined = {
    session: TSession;
    user: TUser;
};

type AuthState = {
    session: TSessionCombined | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    authState: 'signingIn' | 'signedIn' | 'signedOut' | 'signingOut';
};

type AuthActions = {
    initSignIn: () => void;
    setAuth: (session: TSessionCombined | null) => void;
    initSignOut: () => void;
    resetLoading: () => void;
};

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    session: null,
    isAuthenticated: false,
    isLoading: false,
    authState: 'signedOut',
};

export const useAuthStore = create<AuthStore>((set) => ({
    ...initialState,

    /**
     * Set the authentication state
     * @param session - The session object
     * @param user - The user object
     */
    setAuth: (session) =>
        set({
            session,
            isAuthenticated: !!session,
            isLoading: false,
            authState: session ? 'signedIn' : 'signedOut',
        }),

    /**
     * Initialize the sign in process
     */
    initSignIn: () => set({ isLoading: true, authState: 'signingIn' }),

    /**
     * Initialize the sign out process
     */
    initSignOut: () => set({ isLoading: true, authState: 'signingOut' }),

    /**
     * Reset the loading state
     */
    resetLoading: () => set((state) => ({ isLoading: false })),
}));
