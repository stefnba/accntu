'use client';

import { Form, FormInput, FormSubmitButton, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTagEndpoints } from '@/features/tag/api';
import { tagServiceSchemas } from '@/features/tag/schemas';
// import { generateTagColor } from '@/features/tag/utils';

interface TagFormProps {
    tagId?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function TagForm({ tagId, isOpen, onClose }: TagFormProps) {
    const { data: tag } = useTagEndpoints.getById(
        { param: { id: tagId || '' } },
        { enabled: !!tagId }
    );
    const createMutation = useTagEndpoints.create();
    // const updateMutation = useTagEndpoints.update();

    const form = useForm({
        schema: tagId ? tagServiceSchemas.update : tagServiceSchemas.create,
        defaultValues: {
            name: tag?.name || '',
            color: tag?.color || '',
        },
        onSubmit: async (data) => {
            if (tagId) {
                // await updateMutation.mutateAsync({
                //     param: { id: tagId },
                //     json: data,
                // });
            } else {
                await createMutation.mutateAsync({
                    json: data,
                });
            }
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{tagId ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
                </DialogHeader>

                <Form form={form}>
                    <div className="space-y-4">
                        <FormInput
                            form={form}
                            name="name"
                            label="Tag Name"
                            placeholder="Enter tag name"
                            autoFocus
                        />

                        <FormInput form={form} name="color" label="Color" type="color" />

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <FormSubmitButton form={form}>
                                {tagId ? 'Update Tag' : 'Create Tag'}
                            </FormSubmitButton>
                        </div>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
