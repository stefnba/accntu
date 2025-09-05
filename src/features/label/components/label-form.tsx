'use client';

import { Form, FormInput, FormSelect, FormSubmitButton, useUpsertForm } from '@/components/form';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLabelEndpoints } from '@/features/label/api';
import { IconPicker } from '@/features/label/components/icon-picker';
import { LabelBadge } from '@/features/label/components/label-badge';
import { DEFAULT_LABEL_COLOR } from '@/features/label/config';
import { useLabelModal } from '@/features/label/hooks';
import { labelColors, labelServiceSchemas } from '@/features/label/schemas';
import { useEffect, useState } from 'react';

interface LabelFormProps {
    labelId?: string | null;
    parentId?: string | null;
}

export const LabelForm = ({ labelId, parentId }: LabelFormProps) => {
    const isEditMode = Boolean(labelId);

    const { closeModal } = useLabelModal();

    const { data: rootLabels } = useLabelEndpoints.getRoots({});
    const { data: labelData } = useLabelEndpoints.getById(
        {
            param: { id: labelId || '' },
        },
        { enabled: isEditMode }
    );

    const createMutation = useLabelEndpoints.create();
    const updateMutation = useLabelEndpoints.update();

    const [selectedColor, setSelectedColor] = useState('#6B7280');
    const [selectedIcon, setSelectedIcon] = useState<string>('');

    const form = useUpsertForm({
        create: {
            schema: labelServiceSchemas.insert,
            defaultValues: {
                name: '',
                color: '#6B7280',
            },
            onSubmit: async (data) => {
                await createMutation.mutateAsync(
                    { json: data },
                    {
                        onSuccess: () => {
                            closeModal();
                        },
                    }
                );
            },
        },
        update: {
            schema: labelServiceSchemas.update,
            defaultValues: {
                name: labelData?.name || '',
                color: labelData?.color || '#6B7280',
                icon: labelData?.icon || '',
                parentId: labelData?.parentId || undefined,
            },
            onSubmit: async (data) => {
                await updateMutation.mutateAsync(
                    { param: { id: labelId! }, json: data },
                    {
                        onSuccess: () => {
                            closeModal();
                        },
                    }
                );
            },
        },
        isUpdate: isEditMode,
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

    const parentOptions =
        rootLabels
            ?.filter((label) => !isEditMode || label.id !== labelId)
            ?.map((label) => ({
                value: label.id,
                label: label.name,
            })) || [];

    return (
        <Form form={form}>
            <FormInput form={form} name="name" label="Name" placeholder="Enter label name" />

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
            </div>

            <div>
                <Label>Parent Label</Label>
            </div>

            <FormSelect
                form={form}
                name="parentId"
                label="Parent Label"
                placeholder="Select parent label"
                options={parentOptions}
            />

            <Separator className="my-6" />

            <div className="flex items-center gap-4">
                <Label>Preview</Label>
                <LabelBadge
                    label={{
                        id: 'new',
                        color: selectedColor || DEFAULT_LABEL_COLOR,
                        name: form.watch('name') || 'Label',
                        icon: selectedIcon,
                    }}
                />
            </div>

            <Separator className="my-6" />

            <FormSubmitButton form={form}>
                {isEditMode ? 'Update Label' : 'Create Label'}
            </FormSubmitButton>
        </Form>
    );
};
