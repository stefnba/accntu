'use client';

import { labelActions } from '@/actions';
import { CreateLabelSchema } from '@/actions/label/schema';
import { Form, FormInput, FormSubmit, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMutation } from '@/lib/hooks/actions';
import { register } from 'module';
import { LuMoreHorizontal } from 'react-icons/lu';

import { LabelSelect } from '../../_components/label-selection';

export const NewLabelForm = () => {
    const form = useForm(CreateLabelSchema, {
        mode: 'onSubmit',
        defaultValues: {
            name: '',
            parentLabelId: null
        }
    });

    const { execute: handleSubmit } = useMutation(labelActions.create);

    return (
        <div className="w-full max-w-96">
            <Form form={form} onSubmit={handleSubmit}>
                <FormInput
                    autocomplete="off"
                    form={form}
                    name="name"
                    label="Name"
                    type="text"
                />
                <input type="hidden" {...form.register('parentLabelId')} />

                <LabelSelect
                    onSelect={(labelId) =>
                        form.setValue('parentLabelId', labelId.id)
                    }
                />
                <FormSubmit
                    className="mt-10"
                    title="Create Label"
                    form={form}
                />
            </Form>
        </div>
    );
};
