'use client';

import { Form, FormInput, FormSelect, FormSubmitButton, useForm } from '@/components/form';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { useLabelEndpoints } from '../api';
import { labelColors, labelFormSchemas } from '../schemas';

interface LabelFormProps {
    labelId?: string | null;
    parentId?: string | null;
    onSuccess?: () => void;
}

export const LabelForm = ({ labelId, parentId, onSuccess }: LabelFormProps) => {
    const isEditMode = Boolean(labelId);
    
    const { data: rootLabels } = useLabelEndpoints.getRoots({});
    const { data: labelData } = useLabelEndpoints.getById({ 
        param: { id: labelId || '' } 
    }, { enabled: isEditMode });
    
    const createMutation = useLabelEndpoints.create();
    const updateMutation = useLabelEndpoints.update();
    
    const [selectedColor, setSelectedColor] = useState('#6B7280');

    const form = useForm({
        schema: isEditMode ? labelFormSchemas.update : labelFormSchemas.create,
        defaultValues: {
            name: '',
            color: '#6B7280',
            parentId: parentId || undefined,
        },
        onSubmit: async (data) => {
            if (isEditMode && labelId) {
                await updateMutation.mutateAsync({ param: { id: labelId }, json: data });
            } else {
                await createMutation.mutateAsync({ json: { ...data } });
            }
            onSuccess?.();
        },
    });

    useEffect(() => {
        if (labelData) {
            form.reset({
                name: labelData.name,
                color: labelData.color || '#6B7280',
                parentId: labelData.parentId || undefined,
            });
            setSelectedColor(labelData.color || '#6B7280');
        } else if (!isEditMode) {
            form.reset({
                name: '',
                color: '#6B7280',
                parentId: parentId || undefined,
            });
            setSelectedColor('#6B7280');
        }
    }, [labelData, parentId, isEditMode]);

    const parentOptions = rootLabels
        ?.filter((label) => !isEditMode || label.id !== labelId)
        ?.map((label) => ({
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

            <FormSubmitButton form={form}>
                {isEditMode ? 'Update Label' : 'Create Label'}
            </FormSubmitButton>
        </Form>
    );
};
