import { UseZodFormReturn } from '@/components/form/use-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useLabelEndpoints } from '@/features/label/api';
import { LabelListItem } from '@/features/label/components/label-selector/label-list-item';
import { useMemo, useState } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';

type FormLabelSelectProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    form: UseZodFormReturn<TFieldValues>;
    name: TName;
    label?: string;
    description?: string;

    hideError?: boolean;
    className?: string;
    disabled?: boolean;
};

export const FormLabelSelect = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    description,
    className,
}: FormLabelSelectProps<TFieldValues, TName>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [parentId, setParentId] = useState<string | null>(null);
    const { data: allLabels = [] } = useLabelEndpoints.getAllFlattened({});

    const SEARCH_TERM_MIN_LENGTH = 2;
    const isSearchEnabled = searchTerm.length > SEARCH_TERM_MIN_LENGTH;

    const labels = useMemo(() => {
        return isSearchEnabled ? allLabels : allLabels.filter((l) => l.parentId === parentId);
    }, [searchTerm, allLabels, parentId]);

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormControl>
                        <div className="space-y-2">
                            {labels.map((label) => (
                                <LabelListItem
                                    key={label.id}
                                    label={label}
                                    selectedLabelId={field.value}
                                    onSelect={(l) => field.onChange(l)}
                                    onExpand={() => {}}
                                />
                            ))}
                        </div>
                    </FormControl>
                </FormItem>
            )}
        />
    );
};
