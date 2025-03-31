'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { useUserEndpoints } from '@/features/user/api';
import { useAuth } from '@/hooks';
import { UpdateUserSchema } from '@/server/db/schemas';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function UserProfileForm() {
    const { user } = useAuth();

    const { mutate: updateUserMutate } = useUserEndpoints.update({
        errorHandlers: {
            'VALIDATION.INVALID_INPUT': (err) => {
                toast.error('Please check your input');
            },
            default: (err) => {
                toast.error(err.error.message || 'Error updating user');
            },
        },
    });

    const profileForm = useForm({
        schema: UpdateUserSchema,
        defaultValues: {
            firstName: '',
            lastName: '',
        },
        onSubmit: async (data) => {
            updateUserMutate(
                {
                    json: data,
                },
                {
                    onSuccess: () => {
                        toast.success('User updated successfully');
                    },
                }
            );
        },
    });

    const resetForm = profileForm.reset;

    useEffect(() => {
        if (user) {
            profileForm.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            });
        }
    }, [user, resetForm]);

    return (
        <Form form={profileForm} className="space-y-4">
            <div className="flex flex-col gap-6 max-w-lg">
                <FormInput form={profileForm} name="firstName" label="First Name" />
                <FormInput form={profileForm} name="lastName" label="Last Name" />
            </div>
            <div>
                <FormSubmitButton form={profileForm}>Update Profile</FormSubmitButton>
            </div>
        </Form>
    );
}
