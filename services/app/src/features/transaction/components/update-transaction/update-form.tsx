import {
    Form,
    FormInput,
    FormRadio,
    FormSubmit,
    FormTextarea,
    useForm
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from '@/components/ui/form';
import { LabelSelectCommand } from '@/features/label/components/label-select';
import { UpdateTransactionsSchema } from '@/features/transaction/schema/update-transactions';
import { storeTransactionTableRowSelection } from '@/features/transaction/store/table-row-selection';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RxPlusCircled } from 'react-icons/rx';
import { z } from 'zod';

import { useUpdateTransactions } from '../../api/update-transactions';

interface Props {}

const updateableFields = [
    {
        label: 'Title',
        key: 'title'
    },
    {
        label: 'Type',
        key: 'type'
    },
    {
        label: 'Label',
        key: 'label'
    }
    // {
    //     label: 'Note',
    //     key: 'note'
    // },
    // {
    //     label: 'Tags',
    //     key: 'tags'
    // },
];

export const TransactionUpdateForm: React.FC<Props> = () => {
    const [updateFields, setUpdateFields] = useState<string[]>([]);

    const rowSelection = storeTransactionTableRowSelection(
        (state) => state.rowSelection
    );
    const setRowSelection = storeTransactionTableRowSelection(
        (state) => state.setRowSelection
    );

    const { mutate } = useUpdateTransactions();

    const form = useForm(UpdateTransactionsSchema, {
        defaultValues: {
            ids: Object.keys(rowSelection),
            values: {}
        }
    });

    const handleSubmit = (values: z.infer<typeof UpdateTransactionsSchema>) => {
        mutate(values);
    };

    const updateCount = Object.keys(rowSelection).length;

    const formUpdateFields = {
        title: <FormInput label="Title" form={form} name="values.title" />,
        note: <FormTextarea label="Note" form={form} name="values.note" />,
        label: (
            <FormTextarea label="NotLabele" form={form} name="values.labelId" />
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
                onSubmit={handleSubmit}
                form={form}
                className="space-y-8 mt-8"
            >
                {/* Title */}
                {updateFields.includes('title') && (
                    <FormInput label="Title" form={form} name="values.title" />
                )}

                {/* Type */}
                {updateFields.includes('type') && (
                    <FormRadio
                        label="Type"
                        form={form}
                        name="values.type"
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

                {/* Label */}
                {updateFields.includes('label') && (
                    <FormField
                        control={form.control}
                        name="values.labelId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                    <LabelSelectCommand
                                        handleSelect={(s) => {
                                            form.setValue('values.labelId', s, {
                                                shouldValidate: true
                                            });
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}

                {/* Note */}

                {updateFields.length > 0 && (
                    <FormSubmit className="mt-8" form={form}>
                        Update {updateCount} transaction
                        {updateCount > 1 ? 's' : ''}
                    </FormSubmit>
                )}
            </Form>
        </div>
    );
};
