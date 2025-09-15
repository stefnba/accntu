'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Signing in method
 */
export type TSigningInMethod = 'social' | 'email-otp' | 'email-password';

/**
 * Authentication loading state
 */
interface AuthLoadingState {
    isSigningIn: boolean;
    isSigningOut: boolean;
    isAuthLoading: boolean; // true if any of the signing in or signing out is true
    signingInMethod: TSigningInMethod | null;
}

/**
 * Authentication loading actions
 */
interface AuthLoadingActions {
    setSigningIn: (method: TSigningInMethod) => void;
    setSigningOut: () => void;
    resetAuthLoading: () => void;
}

/**
 * Default authentication loading state
 */
const defaultState: AuthLoadingState = {
    isSigningIn: false,
    isSigningOut: false,
    isAuthLoading: false,
    signingInMethod: null,
};

/**
 * Global authentication loading state to handle cross-method loading states.
 *
 * This solves the issue where clicking social auth redirects the page but leaves
 * the form disabled when the user returns. The store automatically resets when
 * authentication succeeds or the page reloads.
 */
export const useAuthLoadingStore = create<AuthLoadingState & AuthLoadingActions>()(
    subscribeWithSelector((set, _get) => ({
        ...defaultState,

        setSigningIn: (method) => {
            set({
                isSigningIn: !!method,
                signingInMethod: method,
                isAuthLoading: true,
            });
        },

        setSigningOut: () => {
            set({
                isSigningOut: true,
                isAuthLoading: true,
            });
        },

        resetAuthLoading: () => {
            set(defaultState);
        },
    }))
);

// Auto-reset when page loads (handles social auth redirects)
if (typeof window !== 'undefined') {
    useAuthLoadingStore.getState().resetAuthLoading();
}
