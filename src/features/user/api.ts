import { apiClient } from '@/lib/api';
import { createMutation } from '@/lib/api/mutation';
import { createQuery } from '@/lib/api/query';

/**
 * User API endpoints with integrated error handling
 */
export const useUserEndpoints = {
    /**
     * Get the current user
     */
    get: createQuery(apiClient.user.me.$get, ['user']),

    /**
     * Update the current user
     */
    update: createMutation(apiClient.user.update.$patch, ['user']),
};
