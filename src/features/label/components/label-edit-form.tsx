'use client';

import { useForm } from '@/components/form';
import { useState } from 'react';

import { Form, FormInput, FormSelect, FormSubmitButton } from '@/components/form';
import { Badge } from '@/components/ui/badge';
import { labelColors, labelFormSchemas, TLabelQuery } from '@/features/label/schemas';
import { useLabelEndpoints } from '../api';

interface LabelEditFormProps {
    label: TLabelQuery['select'];
    onSuccess?: () => void;
}

export const LabelEditForm = ({ label, onSuccess }: LabelEditFormProps) => {
    const { data: rootLabels } = useLabelEndpoints.getRoots({});
    const updateMutation = useLabelEndpoints.update();
    const [selectedColor, setSelectedColor] = useState(label.color);

    const form = useForm({
        schema: labelFormSchemas.update,
        defaultValues: {
            name: label.name,
            color: label.color,
            parentId: label.parentId || undefined,
        },
        onSubmit: (data) => {
            updateMutation.mutate({ param: { id: label.id }, json: data });
            onSuccess?.();
        },
    });

    // useEffect(() => {
    //     form.reset({
    //         name: label.name,
    //         color: label.color,
    //         parentId: label.parentId || undefined,
    //     });
    //     setSelectedColor(label.color);
    // }, [label, form]);

    const parentOptions =
        rootLabels
            ?.filter((rootLabel) => rootLabel.id !== label.id)
            ?.map((rootLabel) => ({
                value: rootLabel.id,
                label: rootLabel.name,
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
                    <Badge style={{ backgroundColor: selectedColor || '#6B7280', color: 'white' }}>
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

            <FormSubmitButton form={form}>Update Label</FormSubmitButton>
        </Form>
    );
};
