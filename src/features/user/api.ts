import { apiClient, createMutation, createQuery } from '@/lib/api';

export const useUserEndpoints = {
    update: createMutation(apiClient.user.update.$patch),
    get: createQuery(apiClient.user.me.$get, ['user']),
};
