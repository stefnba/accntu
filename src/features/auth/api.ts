import { apiClient, createMutation, createQuery } from '@/lib/api';

export const useUserProfile = createQuery(apiClient.user[':id'].$get, 'userProfile');

export const useListUsers = createQuery(apiClient.user.$get, 'listUsers');

export const useCreateUser = createMutation(apiClient.user.$post);

export const useUpdateUser = createMutation(apiClient.user[':id'].$patch);
