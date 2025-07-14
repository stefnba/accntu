'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useProfileUpdateModal } from '@/features/user/hooks';
import { useAuth, useAuthEndpoints } from '@/lib/auth/client';
import { userServiceSchemas } from '@/lib/auth/client/schemas/user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function UserProfileForm() {
    const { closeModal } = useProfileUpdateModal();
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
                        closeModal();
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
        return null;
    }

    return (
        <Form form={profileForm} className="space-y-8 w-lg">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
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

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                    Cancel
                </Button>
                <FormSubmitButton form={profileForm} disabled={profileForm.formState.isSubmitting}>
                    {profileForm.formState.isSubmitting ? 'Updating...' : 'Update Name'}
                </FormSubmitButton>
            </div>
        </Form>
    );
}
