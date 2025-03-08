'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserEndpoints } from '@/features/user/api';
import { useAuth } from '@/hooks';
import { UpdateUserSchema } from '@/server/db/schemas';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function ProfileForm() {
    const { user, isLoading } = useAuth();

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
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
                <Form form={profileForm}>
                    <div className="grid gap-5">
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput form={profileForm} name="firstName" label="First Name" />
                            <FormInput form={profileForm} name="lastName" label="Last Name" />
                        </div>
                    </div>
                    <div className="mt-6">
                        <FormSubmitButton form={profileForm}>Update Profile</FormSubmitButton>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
}
