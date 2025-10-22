'use client';

import { useForm } from '@/components/form';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { useProfileNameUpdateModal } from '@/features/user/hooks';
import { userSchemas } from '@/features/user/schemas';
import { useAuth, useAuthEndpoints } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const ProfileNameUpdateModal = () => {
    const modal = useProfileNameUpdateModal();
    const { user, refetchSession } = useAuth();
    const updateUser = useAuthEndpoints.updateUser();
    const router = useRouter();

    const { Form, Input, SubmitButton } = useForm({
        schema: userSchemas.updateById.form.pick({
            name: true,
            lastName: true,
        }),
        defaultValues: {
            name: '',
            lastName: '',
        },
        initialData: {
            name: user?.name ?? '',
            lastName: user?.lastName ?? '',
        },
        onSubmit: async ({ name, lastName }) => {
            updateUser.mutate(
                {
                    lastName,
                    name,
                },
                {
                    onSuccess: () => {
                        refetchSession();
                        router.refresh();
                        toast.success('Profile updated successfully');
                        modal.close();
                    },
                    onError: (error) => {
                        toast.error(error.message || 'Error updating profile');
                    },
                }
            );
        },
    });

    return (
        <ResponsiveModal size="xl" open={modal.isOpen} onOpenChange={modal.close}>
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>Update Name</ResponsiveModal.Title>
            </ResponsiveModal.Header>
            <Form>
                <ResponsiveModal.Content>
                    <div className="space-y-8">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                            <Input
                                name="name"
                                label="First Name"
                                placeholder="Enter your first name"
                            />
                            <Input
                                name="lastName"
                                label="Last Name"
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>
                </ResponsiveModal.Content>
                <ResponsiveModal.Footer>
                    <Button type="button" variant="outline" onClick={modal.close}>
                        Cancel
                    </Button>
                    <SubmitButton>Update Name</SubmitButton>
                </ResponsiveModal.Footer>
            </Form>
        </ResponsiveModal>
    );
};
