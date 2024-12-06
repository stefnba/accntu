'use client';

import { useRouter } from 'next/navigation';

import { Form, FormDropzone, useForm } from '@/components/form';
import { AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UpdateUserSchema } from '@/features/user/schema/update-user';
import { Avatar } from '@radix-ui/react-avatar';
import React, { useState } from 'react';
import { z } from 'zod';

interface Props {}

export const UpdateUserImageForm: React.FC<Props> = () => {
    const form = useForm(UpdateUserSchema);
    const [image, setImage] = useState<File | null>(null);

    const router = useRouter();

    const handleSubmit = (values: z.infer<typeof UpdateUserSchema>) => {
        alert('not implemented');
        console.log({ values });
    };

    return (
        <Form form={form} onSubmit={handleSubmit} className="mt-4">
            {image && (
                <div className="w-full">
                    <div className="flex justify-center">
                        <Avatar>
                            <AvatarImage
                                className="h-96 w-96 rounded-full"
                                src={URL.createObjectURL(image)}
                            />
                        </Avatar>
                    </div>
                    <div className="mt-6 flex justify-end space-x-2">
                        {/* <Button
                            variant="outline"
                            onClick={() => setImage(null)}
                        >
                            Crop
                        </Button> */}
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setImage(null)}
                        >
                            Change
                        </Button>
                        {/* <Button
                            variant="outline"
                            onClick={() => setImage(null)}
                        >
                            Edit
                        </Button> */}
                        <Button
                            type="submit"
                            className="flex-1"
                            // onClick={() => form.handleSubmit(execute)}
                        >
                            Update Picture
                        </Button>
                    </div>
                </div>
            )}
            <FormDropzone
                form={form}
                name="lastName"
                onDropSuccess={(files) => setImage(files[0])}
                className={image ? 'hidden' : 'block'}
            />
        </Form>
    );
};
