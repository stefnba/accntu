'use client';

import { Form, FormInput, FormSelect, FormSubmitButton, useForm } from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBucketEndpoints } from '@/features/bucket/api';
import {
    bucketStatusEnum,
    bucketTypeEnum,
    insertBucketSchema,
} from '@/features/bucket/server/db/schemas';

export function BucketForm({
    isOpen,
    onClose,
    bucket,
}: {
    isOpen: boolean;
    onClose: () => void;
    bucket?: any;
}) {
    const createMutation = useBucketEndpoints.create({
        onSuccess: () => {
            onClose();
        },
    });

    const updateMutation = useBucketEndpoints.update({
        onSuccess: () => {
            onClose();
        },
    });

    const form = useForm({
        schema: insertBucketSchema,
        defaultValues: bucket || {
            title: '',
            type: 'other',
            status: 'open',
        },
        onSubmit: (data) => {
            if (bucket) {
                updateMutation.mutate({ param: { id: bucket.id }, json: data });
            } else {
                createMutation.mutate({ json: data });
            }
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{bucket ? 'Edit Bucket' : 'Create Bucket'}</DialogTitle>
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
                    <FormSubmitButton form={form}>{bucket ? 'Update' : 'Create'}</FormSubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
