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
import { DEFAULT_LABEL_COLOR } from '@/features/label/config';
import { useLabelUpsertModal } from '@/features/label/hooks';
import { labelServiceSchemas } from '@/features/label/schemas';

interface LabelUpsertFormProps {
    className?: string;
}

export const LabelUpsertForm: React.FC<LabelUpsertFormProps> = () => {
    // ================================
    // Hooks
    // ================================

    const { labelId, parentId, closeModal } = useLabelUpsertModal();

    // ================================
    // API calls
    // ================================
    const createMutation = useLabelEndpoints.create();
    const updateMutation = useLabelEndpoints.update();
    const { data: labelData } = useLabelEndpoints.getById(
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
                color: DEFAULT_LABEL_COLOR,
            },
            onSubmit: async (data) => {
                await createMutation.mutateAsync(
                    {
                        json: data,
                    },
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
            defaultValues: labelData,
            onSubmit: async (data) => {
                await updateMutation.mutateAsync(
                    {
                        param: { id: labelId! },
                        json: data,
                    },
                    {
                        onSuccess: () => {
                            closeModal();
                        },
                    }
                );
            },
        },
        isUpdate: !!labelId,
    });

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
            <div>
                <Label>Parent Label</Label>
            </div>

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
