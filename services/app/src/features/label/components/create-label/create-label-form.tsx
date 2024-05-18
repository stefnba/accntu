import {
    Form,
    FormCombobox,
    FormInput,
    FormSelect,
    FormSubmit,
    FormTextarea,
    useForm
} from '@/components/form';
import { SelectItem } from '@/components/ui/select';
import { useCreateLabel } from '@/features/label/api/create-label';
import { CreateLabelSchema } from '@/features/label/schema/create-label';
import { useEffect } from 'react';
import { z } from 'zod';

import { ColorSelectContent } from '../label-color-select';
import { LabelSelect } from '../label-select';

type CreateLabelFormValues = z.infer<typeof CreateLabelSchema>;

interface Props {}

export const CreateLabelForm: React.FC<Props> = () => {
    const { mutate, isPending } = useCreateLabel();

    const form = useForm(CreateLabelSchema, {
        defaultValues: {
            name: '',
            description: '',
            color: undefined
        },
        disabled: isPending,
        mode: 'onBlur'
    });

    const handleSubmit = (values: CreateLabelFormValues) => {
        console.log({ values });
        mutate(values);
    };

    return (
        <Form className="mt-8 space-y-4" form={form} onSubmit={handleSubmit}>
            <FormInput
                form={form}
                name="name"
                label="Name"
                autocomplete="off"
                placeholder="Provide a name for the label"
            />
            <LabelSelect
                label="Parent Label"
                form={form}
                name="parentId"
                placeholder="Select a Parent Label"
            />
            <FormTextarea
                form={form}
                name="description"
                label="Description"
                placeholder="Give more details about the label"
            />
            <FormSelect
                options={<ColorSelectContent />}
                placeholder="Select a color"
                form={form}
                name="color"
                label="Color"
            />
            <div>
                <FormSubmit className="w-full mt-6" form={form}>
                    Create Label
                </FormSubmit>
            </div>
        </Form>
    );
};
