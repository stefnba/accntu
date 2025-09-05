'use client';

import { Form, FormInput, FormSelect, FormSubmitButton, useForm } from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBucketEndpoints } from '@/features/bucket/api';
import { useCreateUpdateBucketModal } from '@/features/bucket/hooks';
import { bucketServiceSchemas } from '@/features/bucket/schemas';
import { bucketStatusEnum, bucketTypeEnum } from '@/server/db';
import toast from 'react-hot-toast';

export function BucketCreateUpdateModal() {
    const { modalIsOpen, setModal, bucketId, setBucketId, closeModal } =
        useCreateUpdateBucketModal();

    const { mutate: createBucket } = useBucketEndpoints.create();
    const { mutate: updateBucket } = useBucketEndpoints.update();

    const form = useForm({
        schema: bucketServiceSchemas.create,
        defaultValues: {
            title: '',
        },
        onSubmit: (data) => {
            if (bucketId) {
                updateBucket(
                    { param: { id: bucketId }, json: data },
                    {
                        onSuccess() {
                            closeModal();
                            toast.success('Bucket updated successfully');
                        },
                    }
                );
            } else {
                createBucket(
                    { json: data },
                    {
                        onSuccess() {
                            closeModal();
                            toast.success('Bucket created successfully');
                        },
                    }
                );
            }
        },
    });

    return (
        <Dialog open={modalIsOpen} onOpenChange={setModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{bucketId ? 'Edit Bucket' : 'Create Bucket'}</DialogTitle>
                </DialogHeader>
                <Form form={form}>
                    <FormInput name="title" label="Title" form={form} />
                    <FormSelect
                        form={form}
                        name="type"
                        label="Type"
                        options={bucketTypeEnum.enumValues.map((value) => ({
                            value,
                            label: value,
                        }))}
                    />
                    <FormSelect
                        form={form}
                        name="status"
                        label="Status"
                        options={bucketStatusEnum.enumValues.map((value) => ({
                            value,
                            label: value,
                        }))}
                    />
                    <FormSubmitButton form={form}>
                        {bucketId ? 'Update' : 'Create'}
                    </FormSubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
