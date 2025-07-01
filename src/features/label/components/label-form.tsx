'use client';

import { Form, FormInput, FormSelect, FormSubmitButton, useForm } from '@/components/form';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useLabelEndpoints } from '../api';
import { labelColors, labelFormSchemas } from '../schemas';

interface LabelFormProps {
    onSuccess?: () => void;
}

export const LabelForm = ({ onSuccess }: LabelFormProps) => {
    const { data: rootLabels } = useLabelEndpoints.getRoots({
        params: {
            userId: '1',
        },
    });
    const createMutation = useLabelEndpoints.create();
    const [selectedColor, setSelectedColor] = useState('#6B7280');

    const form = useForm({
        schema: labelFormSchemas.create,
        defaultValues: {
            name: '',
            color: '#6B7280',
            parentId: undefined,
        },
        onSubmit: (data) => {
            createMutation.mutate({ json: { ...data, userId: '1' } });
            onSuccess?.();
        },
    });

    const parentOptions =
        rootLabels?.map((label) => ({
            value: label.id,
            label: label.name,
        })) || [];

    return (
        <Form form={form}>
            <FormInput form={form} name="name" label="Label Name" placeholder="Enter label name" />

            <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                    {labelColors.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => {
                                setSelectedColor(color);
                                form.setValue('color', color);
                            }}
                            className={`h-8 w-8 rounded-full border-2 ${
                                selectedColor === color ? 'border-gray-900' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Preview:</span>
                    <Badge style={{ backgroundColor: selectedColor, color: 'white' }}>
                        {form.watch('name') || 'Label'}
                    </Badge>
                </div>
            </div>

            <FormSelect
                form={form}
                name="parentId"
                label="Parent Label (Optional)"
                placeholder="Select parent label"
                options={parentOptions}
            />

            <FormSubmitButton form={form}>Create Label</FormSubmitButton>
        </Form>
    );
};
