import { apiClient, createMutation, createQuery } from '@/lib/api';

export const useAuthEndpoints = {
    requestOtp: createMutation(apiClient.auth['request-otp'].$post),
    verifyOtp: createMutation(apiClient.auth['verify-otp'].$post),
    signupWithEmail: createMutation(apiClient.auth.signup.$post),
    logout: createMutation(apiClient.auth.logout.$post),
    me: createQuery(apiClient.user.me.$get, ['user']),

    // Sessions
    getSessions: createQuery(apiClient.user.sessions.$get, ['sessions']),
    revokeSession: createMutation(apiClient.user.sessions[':sessionId'].$delete, ['sessions']),
    revokeAllSessions: createMutation(apiClient.user.sessions.$delete, ['sessions']),

    // Oauth Login
    initiateLoginWithOauth: createMutation(apiClient.auth[':provider'].authorize.$get),
    verifyOauthCallback: createMutation(apiClient.auth[':provider'].callback.$post),
};
