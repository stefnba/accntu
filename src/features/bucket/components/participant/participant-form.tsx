'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBucketParticipantEndpoints } from '@/features/bucket/api/participant';
import { useCreateUpdateParticipantModal } from '@/features/bucket/hooks/participant';
import { bucketParticipantServiceSchemas } from '@/features/bucket/schemas/participant';
import toast from 'react-hot-toast';

export function ParticipantForm() {
    const { modalIsOpen, setModal, bucketParticipantId, setBucketParticipantId, closeModal } =
        useCreateUpdateParticipantModal();
    const { mutate: createParticipant } = useBucketParticipantEndpoints.create();
    // const { mutate: updateParticipant } = useBucketParticipantEndpoints.update();

    const form = useForm({
        schema: bucketParticipantServiceSchemas.create,
        defaultValues: {
            name: '',
            email: '',
        },
        onSubmit: (data) => {
            if (bucketParticipantId) {
                // updateParticipant({ param: { id: bucketParticipant.id }, json: data });
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
                        {bucketParticipantId ? 'Edit Participant' : 'Add Participant'}
                    </DialogTitle>
                </DialogHeader>
                <Form form={form}>
                    <FormInput name="name" label="Name" form={form} />
                    <FormInput name="email" label="Email" type="email" form={form} />
                    <FormSubmitButton form={form}>
                        {bucketParticipantId ? 'Update' : 'Add'}
                    </FormSubmitButton>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
