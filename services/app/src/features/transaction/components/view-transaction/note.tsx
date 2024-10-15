import { Form, FormSubmit, FormTextarea, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { UpdateTransactionSchema } from '@/features/transaction/schema/update-transaction';
import { useState } from 'react';

import { useUpdateTransaction } from '../../api/update-transaction';

interface Props {
    note: string | null;
    transactionId: string;
}

export const TransactionNote: React.FC<Props> = ({ note, transactionId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { mutateAsync: updateTransactionMutate } = useUpdateTransaction({
        id: transactionId
    });

    const form = useForm(UpdateTransactionSchema, { defaultValues: { note } });

    const handleUpdate = () => {
        updateTransactionMutate({
            note: form.getValues('note')
        }).then(() => {
            setIsEditing(!isEditing);
        });
    };

    if (isEditing) {
        return (
            <Form form={form} onSubmit={handleUpdate}>
                <FormTextarea name="note" form={form} />
                <div className="flex-col space-x-2">
                    <FormSubmit size="sm" form={form}>
                        Update
                    </FormSubmit>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </Form>
        );
    }

    return (
        <div onClick={() => setIsEditing(!isEditing)}>
            <span className="text-justify">
                {note ? (
                    note
                ) : (
                    <span className="italic">{'Click to add a note'}</span>
                )}
            </span>
        </div>
    );
};
