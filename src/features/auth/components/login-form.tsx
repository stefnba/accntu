'use client';

import { Button } from '@/components/ui/button';
import { useUserEndpoints } from '@/features/auth/api';

export function LoginForm() {
    const { data, isLoading } = useUserEndpoints.get({ param: { id: '1' } });
    const { data: users, isLoading: isLoadingUsers } = useUserEndpoints.list({});
    const { mutate: createUser, isPending: isCreatingUser } = useUserEndpoints.create({
        onSuccess: (data) => {
            alert(data.status);
        },
        onError: (error) => {
            alert(error.error);
        },
    });
    const { mutate: updateUser, isPending: isUpdatingUser } = useUserEndpoints.update({
        onSuccess: (data) => {
            alert(data);
        },
        onError: (error) => {
            console.log(error);
        },
    });
    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            LoginForm{' '}
            {users?.map((user) => (
                <div key={user.id}>
                    {user.firstName} {user.lastName} {user.email}
                </div>
            ))}
            <Button
                onClick={() =>
                    createUser({
                        json: {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'dddd',
                        },
                    })
                }
            >
                Create User
            </Button>
            <Button
                onClick={() =>
                    updateUser({
                        json: {
                            firstName: 'John',
                            lastName: 'Doe',
                            image: 'https://example.com/image.png',
                        },
                        param: { id: '1' },
                    })
                }
            >
                Update User
            </Button>
        </div>
    );
}
