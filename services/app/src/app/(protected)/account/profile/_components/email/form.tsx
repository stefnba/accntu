'use client';

import React, { useImperativeHandle } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { set, useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { FormSubmit, FormInput, FormModalSubmit } from '@/components/form';
import { useMutation } from '@/hooks/mutation';
import {
    mutation as profileUpdateAction,
    type InputType as TProfileUpdateSchema,
    Schema as ProfileUpdateSchema
} from '@/actions/user/profile-update';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ExtendedUser } from '@/@types/types';

import { Dispatch, SetStateAction } from 'react';

interface ProfileUpdateFormProps {
    data: ExtendedUser;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const ProfileUpdateForm = ({ data, setOpen }: ProfileUpdateFormProps) => {
    const form = useForm<TProfileUpdateSchema>({
        resolver: zodResolver(ProfileUpdateSchema),
        defaultValues: {
            name: data?.name || ''
        }
    });
    const router = useRouter();

    const { execute } = useMutation(
        profileUpdateAction,
        {
            onSuccess: () => {
                setOpen(false);
                toast.success('Profile updated');
                router.refresh();
            },
            onError: (error) => {
                toast.error('Update failed: ' + error.message);
            },
            onFieldError: (error) => {},
            resetOnSuccess: false
        },
        form
    );

    const onSubmit = async (data: TProfileUpdateSchema) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await execute(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormInput form={form} name="name" label="E-Mail" />
                <FormModalSubmit
                    form={form}
                    setOpen={setOpen}
                    submitText="Update"
                    submitLoadingText="Updating..."
                />
            </form>
        </Form>
    );
};

export default ProfileUpdateForm;
