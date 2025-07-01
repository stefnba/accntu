'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBucketParticipantEndpoints } from '@/features/bucket/api';
import { insertBucketParticipantSchema } from '@/features/bucket/server/db/schemas';

export function ParticipantForm({
    isOpen,
    onClose,
    bucketId,
    participant,
}: {
    isOpen: boolean;
    onClose: () => void;
    bucketId: string;
    participant?: any;
}) {
    const createMutation = useBucketParticipantEndpoints.create({
        onSuccess: () => {
            onClose();
        },
    });

    const updateMutation = useBucketParticipantEndpoints.update({
        onSuccess: () => {
            onClose();
        },
    });

    const form = useForm({
        schema: insertBucketParticipantSchema,
        defaultValues: participant || {
            name: '',
            bucketId: bucketId,
        },
    });

    const onSubmit = (data: any) => {
        if (participant) {
            updateMutation.mutate({ param: { id: participant.id }, json: data });
        } else {
            createMutation.mutate({ param: { bucketId }, json: data });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {participant ? 'Edit Participant' : 'Add Participant'}
                    </DialogTitle>
                </DialogHeader>
                <Form form={form} onSubmit={onSubmit}>
                    <FormInput name="name" label="Name" form={form} />
                    <FormSubmitButton form={form}>
                        {participant ? 'Update' : 'Add'}
                    </FormSubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
