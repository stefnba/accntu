'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AuthLoadingState {
  isSigningIn: boolean;
  signingInMethod: 'social' | 'email-otp' | 'email-password' | null;
  setSigningIn: (method: 'social' | 'email-otp' | 'email-password' | null) => void;
  resetAuthLoading: () => void;
}

/**
 * Global authentication loading state to handle cross-method loading states.
 * 
 * This solves the issue where clicking social auth redirects the page but leaves
 * the form disabled when the user returns. The store automatically resets when
 * authentication succeeds or the page reloads.
 */
export const useAuthLoadingStore = create<AuthLoadingState>()(
  subscribeWithSelector((set, _get) => ({
    isSigningIn: false,
    signingInMethod: null,
    
    setSigningIn: (method) => {
      set({ 
        isSigningIn: !!method, 
        signingInMethod: method 
      });
    },
    
    resetAuthLoading: () => {
      set({ 
        isSigningIn: false, 
        signingInMethod: null 
      });
    },
  }))
);

// Auto-reset when page loads (handles social auth redirects)
if (typeof window !== 'undefined') {
  useAuthLoadingStore.getState().resetAuthLoading();
}