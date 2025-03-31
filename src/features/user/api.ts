import { apiClient } from '@/lib/api';
import { createMutation } from '@/lib/api/mutation';
import { createQuery } from '@/lib/api/query';

export const USER_QUERY_KEYS = {
    USER: 'user',
} as const;

/**
 * User API endpoints with integrated error handling
 */
export const useUserEndpoints = {
    /**
     * Get the current user
     */
    get: createQuery(apiClient.user.me.$get, [USER_QUERY_KEYS.USER]),

    /**
     * Update the current user
     */
    update: createMutation(apiClient.user.update.$patch, [USER_QUERY_KEYS.USER]),
};
