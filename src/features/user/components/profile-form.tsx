'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserEndpoints } from '@/features/user/api';
import { useAuth } from '@/hooks';
import { UpdateUserSchema } from '@/server/db/schemas';
import toast from 'react-hot-toast';

export function ProfileForm() {
    const { user } = useAuth();

    const { mutate: updateUserMutate } = useUserEndpoints.update();

    const profileForm = useForm({
        schema: UpdateUserSchema,
        defaultValues: {
            firstName: 'John',
            lastName: 'Doe',
        },
        onSubmit: async (data) => {
            updateUserMutate(
                {
                    json: data,
                },
                {
                    onError: (error) => {
                        toast.error('Error updating user');
                    },
                    onSuccess: () => {
                        toast.success('User updated successfully');
                    },
                }
            );
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form form={profileForm}>
                    <div className="grid gap-5">
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput form={profileForm} name="firstName" label="First Name" />
                            <FormInput form={profileForm} name="lastName" label="Last Name" />
                        </div>
                        {/* <FormInput
                            form={profileForm}
                            name="email"
                            label="Email"
                            type="email"
                            disabled
                        /> */}
                    </div>
                    <div className="mt-6">
                        <FormSubmitButton form={profileForm}>Update Profile</FormSubmitButton>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
}
