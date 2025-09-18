'use client';

import { useUpsertForm } from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useParticipantEndpoints } from '@/features/participant/api';
import { useCreateUpdateParticipantModal } from '@/features/participant/hooks';
import { participantSchemas } from '@/features/participant/schemas';
import toast from 'react-hot-toast';

export function ParticipantUpsertForm() {
    const { modalIsOpen, setModal, participantId, closeModal } = useCreateUpdateParticipantModal();
    const { mutate: createParticipant } = useParticipantEndpoints.create();
    const { mutate: updateParticipant } = useParticipantEndpoints.update();

    const { Form, Input, SubmitButton } = useUpsertForm({
        create: {
            schema: participantSchemas.create.form,
            defaultValues: {
                name: '',
                email: '',
                linkedUserId: '',
            },
            onSubmit: (data) => {
                createParticipant(
                    { json: data },
                    {
                        onSuccess() {
                            closeModal();
                            toast.success('Participant created successfully');
                        },
                    }
                );
            },
        },
        update: {
            schema: participantSchemas.updateById.form,
            defaultValues: {
                name: '',
                email: '',
                linkedUserId: '',
            },
            onSubmit: (data) => {
                updateParticipant(
                    { param: { id: participantId }, json: data },
                    {
                        onSuccess() {
                            closeModal();
                            toast.success('Participant updated successfully');
                        },
                    }
                );
            },
        },
        mode: participantId ? 'update' : 'create',
    });

    return (
        <Dialog open={modalIsOpen} onOpenChange={setModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {participantId ? 'Edit Participant' : 'Add Participant'}
                    </DialogTitle>
                </DialogHeader>
                <Form>
                    <Input name="name" label="Name" />
                    <Input name="email" label="Email" type="email" />
                    <SubmitButton>{participantId ? 'Update' : 'Add'}</SubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
