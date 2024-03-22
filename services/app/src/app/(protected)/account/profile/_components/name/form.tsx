'use client';

import { useRouter } from 'next/navigation';

import { userActions } from '@/actions';
import { UpdateUserSchema } from '@/actions/user/update';
import {
    Form,
    FormInput,
    FormModalSubmit,
    FormSubmit,
    useForm
} from '@/components/form';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@/hooks/mutation';
import { useSession } from '@/hooks/session';
import { Dispatch, SetStateAction } from 'react';

interface ProfileUpdateFormProps {
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const ProfileUpdateForm = ({ setOpen }: ProfileUpdateFormProps) => {
    const { user, session } = useSession();
    const { toast } = useToast();

    console.log({ user, session });

    const form = useForm(UpdateUserSchema, {
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || ''
        }
    });

    const router = useRouter();

    const { execute } = useMutation(
        userActions.update,
        {
            onSuccess: async () => {
                setOpen(false);

                toast({
                    description: 'Profile updated',
                    variant: 'success'
                });

                router.refresh();
            },
            onError: (error) => {
                toast({
                    description: 'Profile update failed: ' + error.message
                });
            },
            onFieldError: (error) => {},
            resetOnSuccess: false
        },
        form
    );

    return (
        <Form form={form} className="space-y-8" onSubmit={execute}>
            <FormInput form={form} name="firstName" label="First Name" />
            <FormInput form={form} name="lastName" label="Last Name" />
            <FormModalSubmit
                form={form}
                setOpen={setOpen}
                submitText="Update"
                submitLoadingText="Updating..."
            />
        </Form>
    );
};

export default ProfileUpdateForm;
