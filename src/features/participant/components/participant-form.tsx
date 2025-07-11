'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useParticipantEndpoints } from '@/features/participant/api';
import { useCreateUpdateParticipantModal } from '@/features/participant/hooks';
import { participantServiceSchemas } from '@/features/participant/schemas';
import toast from 'react-hot-toast';

export function ParticipantForm() {
    const { modalIsOpen, setModal, participantId, setParticipantId, closeModal } =
        useCreateUpdateParticipantModal();
    const { mutate: createParticipant } = useParticipantEndpoints.create();
    const { mutate: updateParticipant } = useParticipantEndpoints.update();

    const form = useForm({
        schema: participantServiceSchemas.create,
        defaultValues: {
            name: '',
            email: '',
        },
        onSubmit: (data) => {
            if (participantId) {
                updateParticipant(
                    { param: { id: participantId }, json: data },
                    {
                        onSuccess() {
                            closeModal();
                            toast.success('Participant updated successfully');
                        },
                    }
                );
            } else {
                createParticipant(
                    { json: data },
                    {
                        onSuccess() {
                            closeModal();
                            toast.success('Participant created successfully');
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
                    <DialogTitle>
                        {participantId ? 'Edit Participant' : 'Add Participant'}
                    </DialogTitle>
                </DialogHeader>
                <Form form={form}>
                    <FormInput name="name" label="Name" form={form} />
                    <FormInput name="email" label="Email" type="email" form={form} />
                    <FormSubmitButton form={form}>
                        {participantId ? 'Update' : 'Add'}
                    </FormSubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}