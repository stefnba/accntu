'use client';

import { toast } from '@/components/feedback';
import { useUpsertForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useTagEndpoints } from '@/features/tag/api';
import { useTagUpsertModal } from '@/features/tag/hooks';
import { tagSchemas } from '@/features/tag/schemas';

export const TagUpsertForm = () => {
    // ================================
    // Hooks
    // ================================
    const { tagId, modal } = useTagUpsertModal();

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

    const { Form, Input, SubmitButton, ColorSelect } = useUpsertForm({
        create: {
            schema: tagSchemas.create.form,
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
                            modal.close();
                            toast.success('Tag created successfully');
                        },
                    }
                );
            },
        },
        update: {
            schema: tagSchemas.updateById.form,
            defaultValues: {
                name: '',
                color: '',
            },
            initialData: tag,
            onSubmit: async (data) => {
                await updateMutation.mutateAsync(
                    {
                        param: { id: tagId! },
                        json: data,
                    },
                    {
                        onSuccess: () => {
                            modal.close();
                            toast.success('Tag updated successfully');
                        },
                    }
                );
            },
        },
        mode: tagId ? 'update' : 'create',
    });
    return (
        <Form className="">
            <Input name="name" label="Name" placeholder="Enter tag name" autoFocus />

            <ColorSelect cols={8} name="color" label="Color" showClear />

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={modal.close}>
                    Cancel
                </Button>
                <SubmitButton>{tagId ? 'Update Tag' : 'Create Tag'}</SubmitButton>
            </div>
        </Form>
    );
};
