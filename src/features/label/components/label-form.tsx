'use client';

import { Form, FormInput, FormSelect, FormSubmitButton, useForm } from '@/components/form';
import { IconPicker } from '@/components/selectors/icon-picker';
import { Badge } from '@/components/ui/badge';
import { renderLabelIcon } from '@/lib/utils/icon-renderer';
import { useEffect, useState } from 'react';
import { useLabelEndpoints } from '../api';
import { labelColors, labelFormSchemaExtended } from '../schemas';

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
    const [selectedIcon, setSelectedIcon] = useState<string>('');

    const form = useForm({
        schema: isEditMode ? labelFormSchemaExtended.update : labelFormSchemaExtended.create,
        defaultValues: {
            name: '',
            color: '#6B7280',
            icon: '',
            parentId: parentId || undefined,
        },
        onSubmit: async (data) => {
            if (isEditMode && labelId) {
                await updateMutation.mutateAsync({ param: { id: labelId }, json: data });
            } else {
                await createMutation.mutateAsync({ json: data });
            }
            onSuccess?.();
        },
    });

    useEffect(() => {
        if (labelData) {
            form.reset({
                name: labelData.name,
                color: labelData.color || '#6B7280',
                icon: labelData.icon || '',
                parentId: labelData.parentId || undefined,
            });
            setSelectedColor(labelData.color || '#6B7280');
            setSelectedIcon(labelData.icon || '');
        } else if (!isEditMode) {
            form.reset({
                name: '',
                color: '#6B7280',
                icon: '',
                parentId: parentId || undefined,
            });
            setSelectedColor('#6B7280');
            setSelectedIcon('');
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

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Icon</label>
                    <IconPicker
                        value={selectedIcon}
                        onChange={(icon) => {
                            setSelectedIcon(icon);
                            form.setValue('icon', icon);
                        }}
                    />
                </div>

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
                </div>

                <div className="space-y-2">
                    <span className="text-sm font-medium">Preview</span>
                    <div className="flex items-center gap-2">
                        <Badge 
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium"
                            style={{ backgroundColor: selectedColor, color: 'white' }}
                        >
                            {renderLabelIcon(selectedIcon, 'w-4 h-4')}
                            {form.watch('name') || 'Label'}
                        </Badge>
                    </div>
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
