'use client';

import { Form, FormInput, FormSubmit, useForm } from '@/components/form';
import { UpdateUserSchema } from '@/features/user/schema/update-user';
import { z } from 'zod';

import { useUpdateUser } from '../../api/update-user';

interface Props {
    firstName?: string | null;
    lastName?: string | null;
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

    const handleSubmit = (values: z.infer<typeof UpdateUserSchema>) => {
        updateUserMutate(values);
    };

    return (
        <Form onSubmit={handleSubmit} form={form}>
            <div className="flex space-x-6 w-full">
                <FormInput name="firstName" label="First Name" form={form} />
                <FormInput name="lastName" label="Last Name" form={form} />
            </div>
            <FormSubmit form={form}>Save Changes</FormSubmit>
        </Form>
    );
};
