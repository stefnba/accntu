'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthLoadingStore, useSession, useSignOut } from '@/lib/auth/client';
import { useAuthEndpoints } from '@/lib/auth/client/api';

import { authClient } from '@/lib/auth/client/client';
import { useSignInEmailPassword, useSignInSocial } from '@/lib/auth/client/hooks/sign-in';
import { alphabet, generateRandomString } from 'oslo/crypto';

export function AuthStatusClient() {
    const session = useSession();
    const signInEmailPassword = useSignInEmailPassword();
    const signInSocial = useSignInSocial();

    const updateUserMutation = useAuthEndpoints.updateUser();
    const linkedAccounts = useAuthEndpoints.getLinkedAccounts();
    const activeSessions = useAuthEndpoints.getActiveSessions({});

    // Original better-auth hook for comparison
    const useSessionData = authClient.useSession();

    const { signOut } = useSignOut({ redirectToLogin: false });
    const { isAuthLoading } = useAuthLoadingStore();

    // const cache = queryClient.getQueryCache();

    // for (const query of cache.findAll()) {
    //     console.log('query', query.queryKey);
    // }

    // console.log('cache', cache, cache);

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
            <h2 className="text-2xl font-bold">Better Auth useSession (Original)</h2>
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
                <Button disabled={isAuthLoading} onClick={() => signOut()}>
                    Logout
                </Button>

                {/* Login with Email - Using our new type-safe wrapper */}
                <Button
                    disabled={isAuthLoading}
                    onClick={() =>
                        signInEmailPassword.mutate({
                            email: 'test@test.com',
                            password: 'password',
                        })
                    }
                >
                    Login with Password
                </Button>
                {/* Login with Social - Using our new type-safe wrapper */}
                <Button
                    disabled={isAuthLoading}
                    onClick={() => signInSocial.mutate({ provider: 'github' })}
                >
                    Login with Github
                </Button>
                {/* Signup
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

                {/* Update User - Using our new type-safe wrapper */}
                <Button
                    disabled={updateUserMutation.isPending}
                    onClick={() =>
                        updateUserMutation.mutate(
                            {
                                name: generateRandomString(5, alphabet('a-z', 'A-Z')),
                                lastName: generateRandomString(5, alphabet('a-z', 'A-Z')),
                            },
                            {
                                onSuccess: () => {
                                    console.log('Update User onSuccess in component');
                                },
                            }
                        )
                    }
                >
                    Update User
                </Button>
            </div>

            <Separator className="my-4" />
            <h2 className="text-2xl font-bold">List Accounts</h2>
            <div className="mb-4">
                {linkedAccounts.isLoading && <div>Loading accounts...</div>}
                {linkedAccounts.error && <div>Error: {linkedAccounts.error.message}</div>}
                {linkedAccounts.data && (
                    <div>
                        {linkedAccounts.data.map((account) => (
                            <div key={account.id}>
                                {account.providerId} - {account.scopes}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* List Sessions */}
            <Separator className="my-4" />
            <h2 className="text-2xl font-bold">List Sessions</h2>
            <div className="mb-4">
                {activeSessions.isLoading && <div>Loading sessions...</div>}
                {activeSessions.error && <div>Error: {activeSessions.error.message}</div>}
                {activeSessions.data && (
                    <div>
                        {activeSessions.data.map((session) => (
                            <div key={session.id}>
                                {session.id} {String(session.updatedAt)} {session.ipAddress}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
//
