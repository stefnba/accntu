'use client';

import { useForm } from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBucketEndpoints } from '@/features/bucket/api';
import { BUCKET_STATUS_OPTIONS, BUCKET_TYPE_OPTIONS } from '@/features/bucket/constants';
import { useCreateUpdateBucketModal } from '@/features/bucket/hooks';
import { bucketSchemas } from '@/features/bucket/schemas';
import toast from 'react-hot-toast';

export function BucketCreateUpdateModal() {
    const { modalIsOpen, setModal, bucketId, setBucketId, closeModal } =
        useCreateUpdateBucketModal();

    const { mutate: createBucket } = useBucketEndpoints.create();
    const { mutate: updateBucket } = useBucketEndpoints.update();

    const { Form, Input, Select, SubmitButton } = useForm({
        schema: bucketSchemas.create.endpoint.json,
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
                <Form>
                    <Input name="title" label="Title" />
                    <Select
                        name="type"
                        label="Type"
                        options={BUCKET_TYPE_OPTIONS.map((value) => ({
                            value,
                            label: value,
                        }))}
                    />
                    <Select
                        name="status"
                        label="Status"
                        options={BUCKET_STATUS_OPTIONS.map((value) => ({
                            value,
                            label: value,
                        }))}
                    />
                    <SubmitButton>{bucketId ? 'Update' : 'Create'}</SubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
