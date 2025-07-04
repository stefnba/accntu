'use client';

import {
    Form,
    FormInput,
    FormMultiSelect,
    FormSelect,
    FormSubmitButton,
    useForm,
} from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBucketEndpoints } from '@/features/bucket/api/bucket';
import { useParticipantEndpoints } from '@/features/bucket/hooks/participant';
import {
    apiInsertBucketSchema,
    bucketStatusEnum,
    bucketTypeEnum,
} from '@/features/bucket/server/db/schemas';
import { z } from 'zod';

type FormValues = z.infer<typeof apiInsertBucketSchema>;

export function BucketForm({
    isOpen,
    onClose,
    bucket,
}: {
    isOpen: boolean;
    onClose: () => void;
    bucket?: FormValues & { id: string };
}) {
    const { mutate: createBucket, isPending: isCreating } = useBucketEndpoints.create();
    const { mutate: updateBucket, isPending: isUpdating } = useBucketEndpoints.update();

    const { data: participants } = useParticipantEndpoints.getAll({});
    const participantOptions =
        participants?.data.map((p) => ({
            value: p.id,
            label: p.name,
        })) || [];

    const form = useForm({
        schema: apiInsertBucketSchema,
        defaultValues: bucket || {
            title: '',
            type: 'other',
            status: 'open',
            participantIds: [],
        },
    });

    const onSubmit = (data: FormValues) => {
        if (bucket) {
            updateBucket({ param: { id: bucket.id }, json: data });
        } else {
            createBucket({ json: data });
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{bucket ? 'Edit Bucket' : 'Create Bucket'}</DialogTitle>
                </DialogHeader>
                <Form form={form} onSubmit={onSubmit}>
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
                    <FormMultiSelect
                        form={form}
                        name="participantIds"
                        label="Participants"
                        options={participantOptions}
                    />
                    <FormSubmitButton form={form} isPending={isCreating || isUpdating}>
                        {bucket ? 'Update' : 'Create'}
                    </FormSubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
