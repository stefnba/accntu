import { SocialProvider } from '@/features/auth/schemas';
import { apiClient, createMutation, createQuery } from '@/lib/api';

export const useAuthEndpoints = {
    loginWithEmail: createMutation(apiClient.auth.login.$post, ['auth']),
    signupWithEmail: createMutation(apiClient.auth.signup.$post, ['auth']),
    logout: createMutation(apiClient.auth.logout.$post, ['auth']),
    me: createQuery(apiClient.auth.me.$get, ['auth']),

    // Generic social login function
    loginWithSocial: (provider: SocialProvider) => {
        const endpoint = apiClient.auth[provider].$post;
        return createMutation(endpoint, ['auth'])({});
    },
};
