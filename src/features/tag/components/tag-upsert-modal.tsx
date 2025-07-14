'use client';

import {
    Form,
    FormCheckbox,
    FormColorSelect,
    FormInput,
    FormSubmitButton,
    useUpsertForm,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { useTagEndpoints } from '@/features/tag/api';
import { useTagUpsertModal } from '@/features/tag/hooks';
import { tagServiceSchemas } from '@/features/tag/schemas';

export function TagUpsertModal() {
    // ================================
    // Hooks
    // ================================
    const { tagId, setTagId, openModal, isModalOpen, closeModal } = useTagUpsertModal();

    // ================================
    // Queries
    // ================================
    const { data: tag } = useTagEndpoints.getById(
        { param: { id: tagId || '' } },
        { enabled: !!tagId }
    );
    const createMutation = useTagEndpoints.create();
    const updateMutation = useTagEndpoints.update();

    // ================================
    // Form
    // ================================

    const form = useUpsertForm({
        create: {
            schema: tagServiceSchemas.create,
            defaultValues: {
                name: '',
                color: '',
            },
            onSubmit: async (data) => {
                await createMutation.mutateAsync({
                    json: data,
                });
                closeModal();
            },
        },
        update: {
            schema: tagServiceSchemas.update,
            defaultValues: {
                name: tag?.name || '',
                color: tag?.color || '',
                isActive: tag?.isActive || true,
            },
            onSubmit: async (data) => {
                await updateMutation.mutateAsync({
                    param: { id: tagId! },
                    json: data,
                });
            },
        },
        isUpdate: !!tagId,
    });

    return (
        <ResponsiveModal
            title={tagId ? 'Edit Tag' : 'Create New Tag'}
            open={isModalOpen}
            onOpenChange={closeModal}
        >
            <Form form={form} className="">
                <FormInput
                    form={form}
                    name="name"
                    label="Tag Name"
                    placeholder="Enter tag name"
                    autoFocus
                />
                {tagId && <FormCheckbox form={form} name="isActive" label="Active" />}

                <FormColorSelect cols={8} form={form} name="color" label="Color" showClear />

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={closeModal}>
                        Cancel
                    </Button>
                    <FormSubmitButton form={form}>
                        {tagId ? 'Update Tag' : 'Create Tag'}
                    </FormSubmitButton>
                </div>
            </Form>
        </ResponsiveModal>
    );
}
