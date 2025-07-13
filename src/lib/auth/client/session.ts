'use client';

// Re-export all hooks from the hooks directory for backwards compatibility
export {
    useAuth,
    useAuthLoadingStore,
    useRequireAuth,
    useSession,
    useSignIn,
    useSignOut,
    type TClientSession,
} from './hooks';