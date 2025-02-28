'use client';

import { Button } from '@/components/ui/button';
import { useCreateUser, useListUsers, useUpdateUser, useUserProfile } from '@/features/auth/api';

export function LoginForm() {
    const { data, isLoading } = useUserProfile({ param: { id: '1' } });
    const { data: users, isLoading: isLoadingUsers } = useListUsers({});
    const { mutate: createUser, isPending: isCreatingUser } = useCreateUser({
        onSuccess: (data) => {
            alert(data.id);
        },
        onError: (error) => {
            console.error(error);
        },
    });
    const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUser({
        onSuccess: (data) => {
            alert(data);
        },
        onError: (error) => {
            console.error(error);
        },
    });
    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            LoginForm {JSON.stringify(users)}
            <Button
                onClick={() =>
                    createUser({
                        json: {
                            firstName: 'John',
                            lastName: 'Doe',
                            email: 'john.doe@example.com',
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
