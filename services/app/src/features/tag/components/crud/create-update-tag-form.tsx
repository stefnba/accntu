import {
    Form,
    FormInput,
    FormSelect,
    FormSubmit,
    useForm
} from '@/components/form';
import { ColorSelectContent } from '@/features/label/components/label-color-select';
import { useCreateTag } from '@/features/tag/api/create-tag';
import { useUpdateTag } from '@/features/tag/api/update-tag';
import { CreateTagSchema } from '@/features/tag/schema/create-tag';
import { SelectTagSchema } from '@db/schema';
import { z } from 'zod';

type CreateLabelFormValues = z.infer<typeof CreateTagSchema>;

interface Props {
    tag?: z.infer<typeof SelectTagSchema>;
}

export const CreateUpdateTagForm: React.FC<Props> = ({ tag }) => {
    const { mutate: createTagMutate, isPending: createIsPending } =
        useCreateTag();
    const { mutate: updateTagMutate, isPending: UpdateIsPending } =
        useUpdateTag();

    const form = useForm(CreateTagSchema, {
        defaultValues: {
            name: tag?.name ?? '',
            color: tag?.color ?? undefined
        },
        disabled: createIsPending || UpdateIsPending,
        mode: 'onBlur'
    });

    const handleSubmit = (values: CreateLabelFormValues) => {
        if (tag) {
            updateTagMutate({
                id: tag.id,
                ...values
            });
        } else {
            createTagMutate(values);
        }
    };

    return (
        <Form className="mt-8 space-y-4" form={form} onSubmit={handleSubmit}>
            <FormInput
                form={form}
                name="name"
                label="Name"
                autocomplete="off"
                placeholder="Provide a name for the tag"
            />
            <FormSelect
                options={<ColorSelectContent />}
                placeholder="Select a color"
                form={form}
                name="color"
                label="Color"
            />
            <div>
                <FormSubmit className="w-full mt-6" form={form}>
                    {tag ? 'Update' : 'Create'} Tag
                </FormSubmit>
            </div>
        </Form>
    );
};
