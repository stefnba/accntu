'use client';

import { apiClient } from '@/lib/api';
import { AUTH_QUERY_KEYS } from '@/lib/auth/client/api';
import { useAuthStore } from '@/lib/auth/client/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useSignOut = () => {
    const queryClient = useQueryClient();
    const setAuth = useAuthStore((state) => state.setAuth);
    const initSignOut = useAuthStore((state) => state.initSignOut);
    const router = useRouter();
    const { mutate: signOutMutate } = useMutation({
        mutationFn: async () => {
            const res = await apiClient.auth['sign-out'].$post();
            if (!res.ok) throw new Error('Failed to sign out');
            return res.json();
        },
        onSuccess: () => {
            setAuth(null);
            queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.SESSION() });
            router.refresh();
        },
    });

    const _signOut = () => {
        console.log('signing out in useSignOut');
        initSignOut();
        signOutMutate();
    };

    return {
        signOut: _signOut,
    };
};
