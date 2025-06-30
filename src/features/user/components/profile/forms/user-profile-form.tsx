'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { useAuth, useAuthEndpoints } from '@/lib/auth/client';
import { UpdateUserSchema } from '@/server/db/schemas';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function UserProfileForm() {
    const { user } = useAuth();
    const updateUser = useAuthEndpoints.updateUser();
    const router = useRouter();

    const profileForm = useForm({
        schema: UpdateUserSchema.pick({
            name: true,
            lastName: true,
        }),
        defaultValues: {
            name: '',
            lastName: '',
        },
        onSubmit: async (data) => {
            updateUser.mutate(
                {
                    json: data,

                    // name: data.name || '',
                    // lastName: data.lastName || '',
                },
                {
                    onSuccess: () => {
                        router.refresh();
                        toast.success('User updated successfully');
                    },
                    onError: ({ error }) => {
                        toast.error(error.message || 'Error updating user');
                    },
                }
            );
        },
    });

    const resetForm = profileForm.reset;

    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.name || '',
                lastName: user.lastName || '',
            });
        }
    }, [user, resetForm]);

    return (
        <Form form={profileForm} className="space-y-4">
            <div className="flex flex-col gap-6 max-w-lg">
                <FormInput form={profileForm} name="name" label="First Name" />
                <FormInput form={profileForm} name="lastName" label="Last Name" />
            </div>
            <div>
                <FormSubmitButton form={profileForm}>Update Profile</FormSubmitButton>
            </div>
        </Form>
    );
}
