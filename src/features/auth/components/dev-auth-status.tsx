'use client';

import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Separator } from '@/components/ui/separator';
import { useSession, useSignOut } from '@/lib/auth/client';
import { AUTH_QUERY_KEYS } from '@/lib/auth/client/api';
import { authClient } from '@/lib/auth/client/client';
import { useRouter } from 'next/navigation';
import { alphabet, generateRandomString } from 'oslo/crypto';

// const useAuth = () => {
//     return useQuery({
//         queryKey: AUTH_QUERY_KEYS.SESSION,
//         queryFn: async () => {
//             const res = await authClient.getSession();

//             if (res.error) {
//                 throw res.error;
//             }
//             const data = res.data;

//             if (!data) {
//                 throw new Error('Session not found');
//             }

//             return data;
//         },
//     });
// };

const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (params: Parameters<typeof authClient.updateUser>[0]) => {
            return authClient.updateUser({ ...params });
        },
        onSuccess: () => {
            // invalidate session cache to refetch updated user data
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SESSION });

            // refresh page to show updated user data
            router.refresh();
        },
    });
};

const useListAccounts = () => {
    return useQuery({
        queryKey: ['auth-accounts'],
        queryFn: async () => {
            const res = await authClient.listAccounts();

            if (res.error) {
                throw res.error;
            }

            const data = res.data;

            return data;
        },
    });
};

const useSignInEmail = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (params: Parameters<typeof authClient.signIn.email>[0]) => {
            const res = await authClient.signIn.email({ ...params });

            if (res.error) {
                console.log('Error:', res.error);
                throw res.error;
            }

            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SESSION });
            router.refresh();
        },
    });
};

const useSignInSocial = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: Parameters<typeof authClient.signIn.social>[0]) => {
            const res = await authClient.signIn.social({ ...params });

            if (res.error) {
                console.log('Error:', res.error);
                throw res.error;
            }

            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.SESSION });
        },
    });
};

export function AuthStatusClient() {
    const session = useSession();

    const queryClient = useQueryClient();

    const updateUser = useUpdateUser();

    const useSessionData = authClient.useSession();

    const signInEmail = useSignInEmail();

    // const accountList = await authClient.listAccounts();

    const listAccounts = useListAccounts();
    const signInSocial = useSignInSocial();

    const signOut = useSignOut({ redirectToLogin: false });

    return (
        <div className="">
            {/* useQuery */}
            <h2 className="text-2xl font-bold">Our useSession</h2>
            <div className="mb-4">
                {session && (
                    <div>
                        <div>
                            Status:{' '}
                            {session.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                        </div>
                        <div>ID: {session.user?.id}</div>
                        <div>Email: {session.user?.email}</div>
                        <div>Name: {session.user?.name}</div>
                    </div>
                )}
            </div>
            <Separator className="my-4" />
            <h2 className="text-2xl font-bold">Better Auth useSession</h2>
            {useSessionData && <div>ID: {useSessionData.data?.user?.id}</div>}
            {useSessionData && <div>Email: {useSessionData.data?.user?.email}</div>}
            {useSessionData && (
                <div>
                    Name: {useSessionData.data?.user?.name} {useSessionData.data?.user?.lastName}
                </div>
            )}
            <Separator className="my-4" />
            <h2 className="text-2xl font-bold">Actions</h2>
            <div className="flex gap-2">
                {/* Logout */}
                <Button onClick={() => signOut()}>Logout</Button>

                {/* Login with Email */}
                <Button
                    onClick={() =>
                        signInEmail.mutate({
                            email: 'test@test.com',
                            password: 'password',
                        })
                    }
                >
                    Login
                </Button>
                {/* Login with Social */}
                <Button onClick={() => signInSocial.mutate({ provider: 'github' })}>
                    Login with Github
                </Button>
                {/* Signup */}
                <Button
                    onClick={() =>
                        authClient.signUp.email({
                            name: 'Test User',
                            email: 'test@test.com',
                            password: 'password',
                            fetchOptions: {
                                onError: (error) => {
                                    console.log('Error:', error);
                                },
                                onSuccess: (data) => {
                                    console.log('Success:', data);
                                },
                            },
                        })
                    }
                >
                    Signup
                </Button>

                {/* Update User */}
                <Button
                    onClick={() =>
                        updateUser.mutate({
                            name: generateRandomString(5, alphabet('a-z', 'A-Z')),
                            lastName: generateRandomString(5, alphabet('a-z', 'A-Z')),
                        })
                    }
                >
                    Update User
                </Button>
            </div>
            <Separator className="my-4" />
            <h2 className="text-2xl font-bold">List account</h2>
            {listAccounts.data && listAccounts.data.length > 0 && (
                <div>
                    {listAccounts.data.map((account) => (
                        <div key={account.id}>
                            {account.providerId} {account.scopes} {String(account.createdAt)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
