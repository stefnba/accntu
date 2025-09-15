// Note: API imports removed since we're using direct better-auth client methods

import { createBetterAuthMutation, createBetterAuthQuery } from '@/lib/auth/client/api-handlers';
import { authClient } from '@/lib/auth/client/client';
import { useRouter } from 'next/navigation';

export const AUTH_QUERY_KEYS = {
    SESSION: ['auth', 'session'],
    ACTIVE_SESSIONS: ['active-sessions'],
    LINKED_ACCOUNTS: ['linked-accounts'],
} as const;

export const useAuthEndpoints = {
    /**
     * Update user information
     */
    updateUser: createBetterAuthMutation(authClient.updateUser, [AUTH_QUERY_KEYS.SESSION], {
        initHooks: () => {
            const router = useRouter();
            return {
                router,
            };
        },
        onSuccess: ({ hooks }) => {
            hooks.router.refresh();
            console.log('updateUser onSuccess here in useAuthEndpoints');
        },
    }),

    /**
     * Get linked accounts
     */
    getLinkedAccounts: createBetterAuthQuery(
        authClient.listAccounts,
        AUTH_QUERY_KEYS.LINKED_ACCOUNTS
    ),

    /**
     * Get active sessions
     */
    getActiveSessions: createBetterAuthQuery(
        authClient.listSessions,
        AUTH_QUERY_KEYS.ACTIVE_SESSIONS
    ),

    /**
     * Get session
     */
    getSession: createBetterAuthQuery(authClient.getSession, AUTH_QUERY_KEYS.SESSION),

    /**
     * Sign out
     */
    getAccountInfo: createBetterAuthQuery(authClient.accountInfo, AUTH_QUERY_KEYS.SESSION),
};
