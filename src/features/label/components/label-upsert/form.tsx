import { toast } from '@/components/feedback';
import {
    Form,
    FormColorSelect,
    FormInput,
    FormSubmitButton,
    useUpsertForm,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLabelEndpoints } from '@/features/label/api';
import { FormLabelSelect } from '@/features/label/components/label-selector/form';
import { LabelUpsertParentBadge } from '@/features/label/components/label-upsert/parent';
import { useLabelUpsertModal } from '@/features/label/hooks';
import { labelServiceSchemas } from '@/features/label/schemas';

interface LabelUpsertFormProps {
    className?: string;
}

export const LabelUpsertForm: React.FC<LabelUpsertFormProps> = () => {
    // ================================
    // Hooks
    // ================================

    const { labelId, closeModal, parentId } = useLabelUpsertModal();

    // ================================
    // API calls
    // ================================
    const createMutation = useLabelEndpoints.create();
    const updateMutation = useLabelEndpoints.update();
    const { data: labelData, isLoading } = useLabelEndpoints.getById(
        {
            param: { id: labelId || '' },
        },
        { enabled: !!labelId }
    );

    // ================================
    // Form
    // ================================

    const form = useUpsertForm({
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
            defaultValues: {
                ...labelData,
                parentId: parentId,
            },
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
        isUpdate: !!labelId,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Form form={form} className="">
            <FormInput
                form={form}
                name="name"
                label="Name"
                placeholder="Enter label name"
                autoFocus
            />

            <FormColorSelect cols={8} form={form} name="color" label="Color" showClear />

            <div>
                <Label>Icon</Label>
            </div>
            <div className="space-y-2">
                <Label>Parent Label</Label>
                <LabelUpsertParentBadge
                    currentParentId={form.watch('parentId')}
                    setParentId={(p) => {
                        form.setValue('parentId', p);
                        form.trigger('parentId'); // Trigger validation/re-render
                    }}
                />
            </div>

            <FormLabelSelect form={form} name="parentId" label="Parent Label" />

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                    Cancel
                </Button>
                <FormSubmitButton form={form}>
                    {labelId ? 'Update Label' : 'Create Label'}
                </FormSubmitButton>
            </div>
        </Form>
    );
};
