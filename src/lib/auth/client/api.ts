import { apiClient, createQuery } from '@/lib/api';
import { createMutation } from '@/lib/api/mutation';

export const AUTH_QUERY_KEYS = {
    SESSION: () => ['session'] as const,
    SESSIONS: () => ['sessions'] as const,
} as const;

/**
 * User API endpoints with integrated error handling
 */
export const useAuthEndpoints = {
    /**
     * Send verification OTP
     */
    sendVerificationOTP: createMutation(apiClient.auth['email-otp']['send-verification-otp'].$post),
    /**
     * Sign in with social provider
     */
    signInSocial: createMutation(apiClient.auth['sign-in']['social'].$post),
    /**
     * Sign in with email OTP
     */
    signInEmailOTP: createMutation(apiClient.auth['sign-in']['email-otp'].$post),
    /**
     * Sign out
     */
    signOut: createMutation(apiClient.auth['sign-out'].$post),
    /**
     * Get current user session
     */
    getSession: createQuery(apiClient.auth.sessions['get'].$get, AUTH_QUERY_KEYS.SESSION()),
    /**
     * Get all active session for the user
     */
    listsSessions: createQuery(apiClient.auth['sessions'].$get, AUTH_QUERY_KEYS.SESSIONS()),
    /**
     * Revoke other sessions
     */
    revokeOtherSessions: createMutation(
        apiClient.auth.sessions['revoke-others'].$post,
        AUTH_QUERY_KEYS.SESSIONS()
    ),
    /**
     * Revoke session
     */
    revokeSession: createMutation(
        apiClient.auth.sessions['revoke'].$post,
        AUTH_QUERY_KEYS.SESSIONS()
    ),
    /**
     * Update user
     */
    updateUser: createMutation(apiClient.auth.user['update'].$patch),
};
