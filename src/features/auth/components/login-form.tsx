'use client';

import { Button } from '@/components/ui/button';
import { useCreateUser, useUserProfile } from '@/features/auth/api/login';

export function LoginForm() {
    const { data, isLoading } = useUserProfile({ param: { id: '1' } });
    const {
        mutate: createUser,
        isPending: isCreatingUser,
        mutateAsync: createUserAsync,
    } = useCreateUser();
    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            LoginForm {JSON.stringify(data)}
            <Button
                onClick={() =>
                    createUserAsync({ json: { name: 'John Doe', email: 'john.doe@example.com' } })
                        .then((res) => {
                            alert('User created');
                            console.log(res);
                        })
                        .catch((err) => {
                            console.error(err);
                        })
                }
            >
                Create User
            </Button>
        </div>
    );
}
