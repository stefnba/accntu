'use client';

import { toast } from '@/components/feedback';
import { useUpsertForm } from '@/components/form';
import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLabelEndpoints } from '@/features/label/api';
import { LabelSelectorContent } from '@/features/label/components/label-selector';
import { useLabelUpsertModal } from '@/features/label/hooks';
import { labelServiceSchemas } from '@/features/label/schemas';

export const LabelUpsertModal = () => {
    const { isModalOpen, closeModal, labelId, View, setView, setParentId, parentId } =
        useLabelUpsertModal();

    const isEditMode = Boolean(labelId);

    const createMutation = useLabelEndpoints.create();
    const updateMutation = useLabelEndpoints.update();
    const { data: labelData, isLoading } = useLabelEndpoints.getById(
        {
            param: { id: labelId || '' },
        },
        { enabled: !!labelId }
    );

    const { Form, Input, SubmitButton, ColorSelect } = useUpsertForm({
        create: {
            schema: labelServiceSchemas.insert,
            defaultValues: {
                name: '',
                color: '',
                parentId: parentId,
            },
            onSubmit: async (data) => {
                await createMutation.mutateAsync(
                    {
                        json: data,
                    },
                    {
                        onSuccess: () => {
                            closeModal();
                            toast.success('Label created');
                        },
                    }
                );
            },
        },
        update: {
            schema: labelServiceSchemas.update,
            defaultValues: labelData
                ? {
                      name: labelData.name,
                      color: labelData.color || '',
                      parentId: parentId || labelData.parentId,
                      icon: labelData.icon,
                      imageUrl: labelData.imageUrl,
                      firstParentId: labelData.firstParentId,
                  }
                : {
                      name: '',
                      color: '',
                      parentId: parentId,
                  },
            initialData: labelData
                ? {
                      name: labelData.name,
                      color: labelData.color || undefined,
                      parentId: labelData.parentId,
                      icon: labelData.icon,
                      imageUrl: labelData.imageUrl,
                      firstParentId: labelData.firstParentId,
                  }
                : undefined,
            onSubmit: async (data) => {
                await updateMutation.mutateAsync(
                    {
                        param: { id: labelId! },
                        json: data,
                    },
                    {
                        onSuccess: () => {
                            closeModal();
                            toast.success('Label updated');
                        },
                    }
                );
            },
        },
        mode: labelId ? 'update' : 'create',
    });

    const handleParentSelect = (selectedLabelId: string | null) => {
        setParentId(selectedLabelId);
        setView('form');
    };

    if (isLoading && labelId) {
        return null;
    }

    return (
        <ResponsiveModal open={isModalOpen} onOpenChange={closeModal} size="lg">
            {/* Create view */}
            <View name="form">
                <Form>
                    <ResponsiveModal.Header>
                        <ResponsiveModal.Title>
                            {isEditMode ? 'Edit Label' : 'Create New Label'}
                        </ResponsiveModal.Title>
                    </ResponsiveModal.Header>
                    <ResponsiveModal.Content>
                        <div className="space-y-4">
                            <Input
                                name="name"
                                label="Name"
                                placeholder="Enter label name"
                                autoFocus
                            />

                            <ColorSelect cols={8} name="color" label="Color" />

                            <div className="space-y-2">
                                <Label>Parent Label</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setView('parent')}
                                >
                                    {parentId ? 'Change Parent' : 'Select Parent Label'}
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setView('icon')}
                                >
                                    Select Icon
                                </Button>
                            </div>
                        </div>
                    </ResponsiveModal.Content>
                    <ResponsiveModal.Footer>
                        <Button type="button" variant="outline" onClick={closeModal}>
                            Cancel
                        </Button>
                        <SubmitButton>{labelId ? 'Update Label' : 'Create Label'}</SubmitButton>
                    </ResponsiveModal.Footer>
                </Form>
            </View>

            {/* Parent view */}
            <View name="parent">
                <ResponsiveModal.Header>
                    <ResponsiveModal.Title>Select Parent Label</ResponsiveModal.Title>
                </ResponsiveModal.Header>
                <ResponsiveModal.Content>
                    <LabelSelectorContent onSelect={handleParentSelect} />
                </ResponsiveModal.Content>
                <ResponsiveModal.Footer>
                    <Button variant="outline" onClick={() => setView('form')}>
                        Back
                    </Button>
                </ResponsiveModal.Footer>
            </View>

            {/* Icon view */}
            <View name="icon">
                <ResponsiveModal.Header>
                    <ResponsiveModal.Title>Select Icon</ResponsiveModal.Title>
                </ResponsiveModal.Header>
                <ResponsiveModal.Content>
                    <div>Icon selection coming soon...</div>
                </ResponsiveModal.Content>
                <ResponsiveModal.Footer>
                    <Button variant="outline" onClick={() => setView('form')}>
                        Back
                    </Button>
                </ResponsiveModal.Footer>
            </View>
        </ResponsiveModal>
    );
};
