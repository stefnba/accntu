'use client';

import { Form, FormFileDropzone, useForm } from '@/components/form';
import { useAuthEndpoints } from '@/lib/auth/client';
import { userServiceSchemas } from '@/lib/auth/client/schemas/user';
import toast from 'react-hot-toast';

export function UserImageForm() {
    const { mutate: updateUserMutate } = useAuthEndpoints.updateUser({
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
        schema: userServiceSchemas.update.pick({
            image: true,
        }),
        defaultValues: {
            image: '',
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

    return (
        <Form form={profileForm} className="space-y-4">
            <FormFileDropzone
                form={profileForm}
                name="image"
                maxFiles={1}
                maxSize={1024 * 1024 * 2} // 2MB
                accept={{
                    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
                }}
                dropzoneTitle="Drag & drop your profile image here"
                dropzoneDescription="PNG, JPG, or GIF up to 2MB"
                onChange={(files) => console.log(files)}
            />
        </Form>
    );
}
