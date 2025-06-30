'use client';

import { apiClient } from '@/lib/api';
import { AUTH_QUERY_KEYS } from '@/lib/auth/client/api';
import { useAuthStore } from '@/lib/auth/client/store';
import { LOGIN_URL } from '@/lib/routes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useSession = () => {
    const authState = useAuthStore((state) => state.authState);
    const setAuth = useAuthStore((state) => state.setAuth);
    const session = useAuthStore((state) => state.session);
    const queryClient = useQueryClient();
    const router = useRouter();
    console.log('authState in useSession', authState);

    const initialData = session;

    const { data, isError, refetch } = useQuery({
        queryKey: AUTH_QUERY_KEYS.SESSION(),
        enabled: authState === 'signedIn',
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: 2 * 60 * 1000,
        refetchInterval: 2 * 60 * 1000,
        queryFn: async () => {
            console.log('fetching session in useSession with Tanstack Query');
            const res = await apiClient.auth['sessions']['get'].$get();
            if (!res.ok) throw new Error('Failed to fetch session');
            return res.json();
        },
        initialData,
    });

    // set the cache data when the initialData changes
    useEffect(() => {
        console.log('initialData changed in useSession', initialData);
        queryClient.setQueryData(AUTH_QUERY_KEYS.SESSION(), initialData);
    }, [initialData]);

    // set the auth state when the session is fetched
    useEffect(() => {
        if (data && data !== initialData) {
            console.log('setting auth state in useSession with Tanstack Query', data.user);
            setAuth(data);
        }
    }, [data, setAuth]);

    // set the auth state when the session is not found
    useEffect(() => {
        if (isError) {
            setAuth(null);

            // redirect to login page
            router.push(LOGIN_URL);
            router.refresh();
        }
    }, [isError]);

    return {
        session: session?.session || null,
        user: session?.user || null,
        refetchSession: refetch,
    };
};
