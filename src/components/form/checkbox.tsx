import { UseZodFormReturn } from '@/components/form/hooks';
import { Checkbox } from '@/components/ui/checkbox';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { FieldPath, FieldValues } from 'react-hook-form';

type FormCheckboxProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TTransformedValues extends FieldValues = TFieldValues,
> = {
    form: UseZodFormReturn<TFieldValues, any, TTransformedValues>;
    name: TName;
    label: string;
    description?: string;
    hideError?: boolean;
    disabled?: boolean;
    className?: string;
};

export function FormCheckbox<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TTransformedValues extends FieldValues = TFieldValues,
>({
    form,
    name,
    label,
    description,
    hideError = false,
    disabled,
    className,
}: FormCheckboxProps<TFieldValues, TName, TTransformedValues>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={`flex flex-row items-start space-x-3 space-y-0 ${className}`}>
                    <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>{label}</FormLabel>
                        {description && <FormDescription>{description}</FormDescription>}
                        {!hideError && <FormMessage />}
                    </div>
                </FormItem>
            )}
        />
    );
}
