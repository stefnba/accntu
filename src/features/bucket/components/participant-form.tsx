'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useParticipantEndpoints } from '@/features/bucket/hooks/bucketParticipant';
import { insertParticipantSchema } from '@/features/bucket/server/db/schemas';
import { z } from 'zod';

type FormValues = z.infer<typeof insertParticipantSchema>;

export function ParticipantForm({
    isOpen,
    onClose,
    bucketParticipant,
}: {
    isOpen: boolean;
    onClose: () => void;
    bucketParticipant?: { id: string } & FormValues;
}) {
    const { mutate: createParticipant, isPending: isCreating } = useParticipantEndpoints.create();
    const { mutate: updateParticipant, isPending: isUpdating } = useParticipantEndpoints.update();

    const form = useForm({
        schema: insertParticipantSchema,
        defaultValues: bucketParticipant || {
            name: '',
            email: '',
        },
    });

    const onSubmit = (data: FormValues) => {
        if (bucketParticipant) {
            updateParticipant({ param: { id: bucketParticipant.id }, json: data });
        } else {
            createParticipant({ json: data });
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {bucketParticipant ? 'Edit Participant' : 'Add Participant'}
                    </DialogTitle>
                </DialogHeader>
                <Form form={form} onSubmit={onSubmit}>
                    <FormInput name="name" label="Name" form={form} />
                    <FormInput name="email" label="Email" type="email" form={form} />
                    <FormSubmitButton form={form} isPending={isCreating || isUpdating}>
                        {bucketParticipant ? 'Update' : 'Add'}
                    </FormSubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
