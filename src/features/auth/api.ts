import { apiClient, createMutation, createQuery } from '@/lib/api';

export const useAuthEndpoints = {
    login: createMutation(apiClient.auth.login.$post, ['auth']),
    logout: createMutation(apiClient.auth.logout.$post, ['auth']),
    signup: createMutation(apiClient.auth.signup.$post, ['auth']),
    me: createQuery(apiClient.auth.me.$get, ['auth']),
};
