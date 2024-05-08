import { transactionActions } from '@/actions';
import { update } from '@/actions/label';
import { UpdateTransactionSchema } from '@/actions/transaction/schema';
import {
    Form,
    FormInput,
    FormRadio,
    FormSubmit,
    useForm
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { label } from '@/lib/db/schema';
import { useMutation } from '@/lib/hooks/actions';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { set } from 'date-fns';
import { useState } from 'react';
import { RxPlusCircled } from 'react-icons/rx';

import { useTransactionTableRowSelectionStore } from '../table/store';

interface Props {
    handleClose: () => void;
}

const updateableFields = [
    {
        label: 'Title',
        key: 'title'
    },
    {
        label: 'Type',
        key: 'type'
    }
    // {
    //     label: 'Label',
    //     key: 'label'
    // },
    // {
    //     label: 'Note',
    //     key: 'note'
    // },
    // {
    //     label: 'Tags',
    //     key: 'tags'
    // },
];

export const TransactionUpdateForm: React.FC<Props> = ({ handleClose }) => {
    const [updateFields, setUpdateFields] = useState<string[]>([]);

    const rowSelection = useTransactionTableRowSelectionStore(
        (state) => state.rowSelection
    );
    const setRowSelection = useTransactionTableRowSelectionStore(
        (state) => state.setRowSelection
    );

    const queryClient = useQueryClient();

    const { execute: executeUpdateTransactions } = useMutation(
        transactionActions.update,
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
                handleClose();
                setRowSelection({});
            }
        }
    );

    const form = useForm(UpdateTransactionSchema, {
        defaultValues: {
            data: {
                title: ''
            },
            id: Object.keys(rowSelection)
        }
    });

    const updateCount = Object.keys(rowSelection).length;

    const formUpdateFields = {
        title: (
            <FormInput
                // className="mt-8"
                label="Title"
                form={form}
                name="data.title"
            />
        )
    };

    return (
        <div>
            <div className="grid-cols-4 space-x-2 my-8">
                {updateableFields.map((field) => (
                    <Button
                        key={field.key}
                        variant="outline"
                        size="sm"
                        className={cn(
                            updateFields.includes(field.key) &&
                                'bg-primary text-white border-primary hover:bg-primary/90 hover:text-white',
                            'h-8 border-dashed'
                        )}
                        onClick={() => {
                            if (updateFields.includes(field.key)) {
                                setUpdateFields(
                                    updateFields.filter(
                                        (key) => key !== field.key
                                    )
                                );
                                return;
                            }
                            setUpdateFields([...updateFields, field.key]);
                        }}
                    >
                        <RxPlusCircled className="mr-2 h-4 w-4" />
                        {field.label}
                    </Button>
                ))}
            </div>

            <Form
                onSubmit={executeUpdateTransactions}
                form={form}
                className="space-y-8 mt-8"
            >
                {/* Title */}
                {updateFields.includes('title') && (
                    <FormInput label="Title" form={form} name="data.title" />
                )}

                {/* Type */}
                {updateFields.includes('type') && (
                    <FormRadio
                        label="Type"
                        form={form}
                        name="data.type"
                        options={[
                            {
                                label: 'Credit',
                                value: 'CREDIT'
                            },
                            {
                                label: 'Debit',
                                value: 'DEBIT'
                            },
                            {
                                label: 'Transfer',
                                value: 'TRANSFER'
                            }
                        ]}
                    />
                )}

                {updateFields.length > 0 && (
                    <FormSubmit
                        title={`Update ${updateCount} transaction${updateCount > 1 ? 's' : ''}`}
                        className="mt-8"
                        form={form}
                    />
                )}
            </Form>
        </div>
    );
};
