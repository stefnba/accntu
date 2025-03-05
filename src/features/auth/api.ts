import { apiClient, createMutation, createQuery } from '@/lib/api';

export const useAuthEndpoints = {
    requestOtp: createMutation(apiClient.auth['request-otp'].$post),
    verifyOtp: createMutation(apiClient.auth['verify-otp'].$post),
    signupWithEmail: createMutation(apiClient.auth.signup.$post),
    logout: createMutation(apiClient.auth.logout.$post),
    me: createQuery(apiClient.user.me.$get),

    // Oauth Login
    loginWithGithub: createMutation(apiClient.auth.github.authorize.$get),
    loginWithGoogle: createMutation(apiClient.auth.google.authorize.$get),
    loginWithApple: createMutation(apiClient.auth.apple.authorize.$get),

    // OAuth Callback
    verifyGithub: createMutation(apiClient.auth.github.callback.$post),
    verifyGoogle: createMutation(apiClient.auth.google.callback.$post),
};
