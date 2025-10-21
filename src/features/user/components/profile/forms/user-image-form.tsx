'use client';

import { FormFileDropzone, useForm } from '@/components/form';
import { userSchemas } from '@/features/user/schemas';
import { useAuthEndpoints } from '@/lib/auth/client';
import toast from 'react-hot-toast';

export function UserImageForm() {
    const updateUser = useAuthEndpoints.updateUser();

    const { Form, form } = useForm({
        schema: userSchemas.updateById.form.pick({
            image: true,
        }),
        defaultValues: {
            image: '',
        },
        onSubmit: async ({ image }) => {
            updateUser.mutate(
                {
                    image,
                },
                {
                    onSuccess: () => {
                        toast.success('Profile image updated successfully');
                    },
                }
            );
        },
    });

    return (
        <Form className="space-y-4">
            <FormFileDropzone
                form={form}
                name="image"
                maxFiles={1}
                maxSize={1024 * 1024 * 5} // 5MB
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
