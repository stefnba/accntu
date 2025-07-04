'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useParticipantEndpoints } from '@/features/bucket/hooks/participant';
import { insertParticipantSchema } from '@/features/bucket/server/db/schemas';
import { z } from 'zod';

type FormValues = z.infer<typeof insertParticipantSchema>;

export function ParticipantForm({
    isOpen,
    onClose,
    participant,
}: {
    isOpen: boolean;
    onClose: () => void;
    participant?: { id: string } & FormValues;
}) {
    const { mutate: createParticipant, isPending: isCreating } = useParticipantEndpoints.create();
    const { mutate: updateParticipant, isPending: isUpdating } = useParticipantEndpoints.update();

    const form = useForm({
        schema: insertParticipantSchema,
        defaultValues: participant || {
            name: '',
            email: '',
        },
    });

    const onSubmit = (data: FormValues) => {
        if (participant) {
            updateParticipant({ param: { id: participant.id }, json: data });
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
                        {participant ? 'Edit Participant' : 'Add Participant'}
                    </DialogTitle>
                </DialogHeader>
                <Form form={form} onSubmit={onSubmit}>
                    <FormInput name="name" label="Name" form={form} />
                    <FormInput name="email" label="Email" type="email" form={form} />
                    <FormSubmitButton form={form} isPending={isCreating || isUpdating}>
                        {participant ? 'Update' : 'Add'}
                    </FormSubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
