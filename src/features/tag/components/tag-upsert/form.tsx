'use client';

import { toast } from '@/components/feedback';
import {
    Form,
    FormColorSelect,
    FormInput,
    FormSubmitButton,
    useUpsertForm,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { useTagEndpoints } from '@/features/tag/api';
import { useTagUpsertModal } from '@/features/tag/hooks';
import { tagServiceSchemas } from '@/features/tag/schemas';

export const TagUpsertForm = () => {
    // ================================
    // Hooks
    // ================================

    const { tagId, closeModal } = useTagUpsertModal();

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
                await createMutation.mutateAsync(
                    {
                        json: data,
                    },
                    {
                        onSuccess: () => {
                            closeModal();
                            toast.success('Tag created successfully');
                        },
                    }
                );
            },
        },
        update: {
            schema: tagServiceSchemas.update,
            defaultValues: tag,
            onSubmit: async (data) => {
                await updateMutation.mutateAsync(
                    {
                        param: { id: tagId! },
                        json: data,
                    },
                    {
                        onSuccess: () => {
                            closeModal();
                            toast.success('Tag updated successfully');
                        },
                    }
                );
            },
        },
        isUpdate: !!tagId,
    });
    return (
        <Form form={form} className="">
            <FormInput
                form={form}
                name="name"
                label="Name"
                placeholder="Enter tag name"
                autoFocus
            />

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
    );
};
