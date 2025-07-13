'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useAuthEndpoints } from '@/lib/auth/client';
import { userServiceSchemas } from '@/lib/auth/client/schemas/user';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function UserProfileForm() {
    const { user, refetchSession } = useAuth();

    const updateUser = useAuthEndpoints.updateUser();
    const router = useRouter();

    const profileForm = useForm({
        schema: userServiceSchemas.update.pick({
            name: true,
            lastName: true,
        }),
        defaultValues: {
            name: '',
            lastName: '',
        },
        onSubmit: async (data) => {
            updateUser.mutate(
                { json: data },
                {
                    onSuccess: () => {
                        refetchSession();
                        router.refresh();
                        toast.success('Profile updated successfully');
                    },
                    onError: ({ error }) => {
                        toast.error(error.message || 'Error updating profile');
                    },
                }
            );
        },
    });

    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.name || '',
                lastName: user.lastName || '',
            });
        }
    }, [user, profileForm.reset]);

    if (!user) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">Please sign in to edit your profile.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                </CardTitle>
                <CardDescription>Update your first and last name</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Profile Form */}
                    <Form form={profileForm} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormInput
                                form={profileForm}
                                name="name"
                                label="First Name"
                                placeholder="Enter your first name"
                            />
                            <FormInput
                                form={profileForm}
                                name="lastName"
                                label="Last Name"
                                placeholder="Enter your last name"
                            />
                        </div>

                        <div className="flex justify-end">
                            <FormSubmitButton
                                form={profileForm}
                                disabled={profileForm.formState.isSubmitting}
                            >
                                {profileForm.formState.isSubmitting ? 'Updating...' : 'Update Name'}
                            </FormSubmitButton>
                        </div>
                    </Form>
                </div>
            </CardContent>
        </Card>
    );
}
