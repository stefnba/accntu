import {
    Form,
    FormInput,
    FormSelect,
    FormSubmit,
    FormTextarea,
    useForm
} from '@/components/form';
import { TLabelsResponse } from '@/features/label/api/get-labels';
import { useUpdateLabel } from '@/features/label/api/update-label';
import { UpdateLabelSchema } from '@/features/label/schema/update-label';
import { z } from 'zod';

import { ColorSelectContent } from '../label-color-select';

interface Props {
    label: TLabelsResponse[0];
}

export const UpdateLabelForm: React.FC<Props> = ({ label }) => {
    const { mutate: updateLabelMutation } = useUpdateLabel();

    const form = useForm(UpdateLabelSchema, {
        defaultValues: {
            name: label?.name || '',
            description: label?.description || '',
            color: label?.color || ''
        }
    });

    const handleSubmit = (values: z.infer<typeof UpdateLabelSchema>) => {
        updateLabelMutation({
            id: label.id,
            values
        });
    };

    return (
        <Form className="mt-8 space-y-4" form={form} onSubmit={handleSubmit}>
            <FormInput
                form={form}
                name="name"
                label="Name"
                autocomplete="off"
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
                <FormSubmit className="w-full mt-4" form={form}>
                    Save Changes
                </FormSubmit>
            </div>
        </Form>
    );
};
