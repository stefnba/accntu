import { apiClient, createMutation, createQuery } from '@/lib/api';

export const useAuthEndpoints = {
    loginWithEmail: createMutation(apiClient.auth['request-otp'].$post, ['auth']),
    verifyEmailLogin: createMutation(apiClient.auth['verify-otp'].$post, ['auth']),
    signupWithEmail: createMutation(apiClient.auth.signup.$post, ['auth']),
    logout: createMutation(apiClient.auth.logout.$post, ['auth']),
    me: createQuery(apiClient.auth.me.$get, ['auth']),

    // Oauth Login
    loginWithGithub: createMutation(apiClient.auth.github.authorize.$get, ['auth']),
    loginWithGoogle: createMutation(apiClient.auth.google.authorize.$get, ['auth']),
    loginWithApple: createMutation(apiClient.auth.apple.authorize.$get, ['auth']),
};
