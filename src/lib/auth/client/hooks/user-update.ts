'use client';

import { authClient } from '@/lib/auth/client/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AUTH_QUERY_KEYS } from '../api';

/**
 * Hook for updating user information using better-auth client
 * Automatically invalidates session cache after successful update
 */
export const useUserUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userData: {
            name?: string;
            email?: string;
            image?: string;
            [key: string]: any;
        }) => {
            const result = await authClient.user.update({
                ...userData,
            });

            if (!result.data) {
                throw new Error('Failed to update user');
            }

            return result.data;
        },
        onSuccess: () => {
            // Invalidate session cache to refetch updated user data
            queryClient.invalidateQueries({
                queryKey: AUTH_QUERY_KEYS.SESSION,
            });
        },
        onError: (error) => {
            console.error('User update failed:', error);
        },
    });
};