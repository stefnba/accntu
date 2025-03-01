import { apiClient, createMutation, createQuery } from '@/lib/api';

export const useUserEndpoints = {
    create: createMutation(apiClient.user.$post, ['users']),
    update: createMutation(apiClient.user[':id'].$patch, ['users']),
    list: createQuery(apiClient.user.$get, ['users']),
    get: createQuery(apiClient.user[':id'].$get, ['userProfile']),
};
