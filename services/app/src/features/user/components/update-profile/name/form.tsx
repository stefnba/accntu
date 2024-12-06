'use client';

import { Form, FormInput, FormSubmit, useForm } from '@/components/form';
import { useUserUpdateModal } from '@/features/user/hooks/user-update-modal';
import { UpdateUserSchema } from '@/features/user/schema/update-user';
import { useUpdateUser } from '@features/user/api/update-user';
import { z } from 'zod';

interface Props {
    firstName: string | null;
    lastName: string | null;
}

export const UpdateNameForm: React.FC<Props> = ({ firstName, lastName }) => {
    const form = useForm(UpdateUserSchema, {
        defaultValues: {
            firstName: firstName || '',
            lastName: lastName || '',
            settings: {}
        }
    });

    const { mutate: updateUserMutate } = useUpdateUser('name');
    const { handleClose } = useUserUpdateModal();

    const handleSubmit = (values: z.infer<typeof UpdateUserSchema>) => {
        updateUserMutate(values, {
            onSuccess: () => {
                handleClose();
            }
        });
    };

    return (
        <Form onSubmit={handleSubmit} form={form}>
            <div className="w-full flex-col gap-4 flex">
                <FormInput name="firstName" label="First Name" form={form} />
                <FormInput name="lastName" label="Last Name" form={form} />
                <FormSubmit form={form}>Update</FormSubmit>
            </div>
        </Form>
    );
};
