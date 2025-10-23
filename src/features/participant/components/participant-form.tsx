'use client';

import { useUpsertForm } from '@/components/form';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { useParticipantEndpoints } from '@/features/participant/api';
import { useUpsertParticipantModal } from '@/features/participant/hooks';
import { participantSchemas } from '@/features/participant/schemas';
import toast from 'react-hot-toast';

export function ParticipantUpsertForm() {
    const { modal, participantId } = useUpsertParticipantModal();
    const { mutate: createParticipant } = useParticipantEndpoints.create();
    const { mutate: updateParticipant } = useParticipantEndpoints.update();

    const { form, Input, SubmitButton, Form } = useUpsertForm({
        create: {
            schema: participantSchemas.create.form,
            defaultValues: {
                name: '',
                email: '',
            },
            onSubmit: (data) => {
                createParticipant(
                    { json: data },
                    {
                        onSuccess() {
                            modal.close();
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
            },
            onSubmit: (data) => {
                updateParticipant(
                    { param: { id: participantId! }, json: data },
                    {
                        onSuccess() {
                            modal.close();
                            toast.success('Participant updated successfully');
                        },
                    }
                );
            },
        },
        mode: participantId ? 'update' : 'create',
    });

    return (
        <ResponsiveModal open={modal.isOpen} onOpenChange={modal.close} size="lg">
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>
                    {participantId ? 'Edit Participant' : 'Add Participant'}
                </ResponsiveModal.Title>
            </ResponsiveModal.Header>
            <Form>
                <ResponsiveModal.Content className="space-y-8">
                    <Input name="name" label="Name" aria-label="Participant name" autoFocus />
                    <Input name="email" label="Email" type="email" aria-label="Participant email" />
                </ResponsiveModal.Content>
                <ResponsiveModal.Footer>
                    <Button variant="outline" onClick={modal.close}>
                        Cancel
                    </Button>
                    <SubmitButton>{participantId ? 'Update' : 'Add'}</SubmitButton>
                </ResponsiveModal.Footer>
            </Form>
        </ResponsiveModal>
    );
}
