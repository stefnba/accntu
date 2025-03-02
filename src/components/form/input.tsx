import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseZodFormReturn } from '@/hooks/use-form';
import { InputHTMLAttributes } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';

type FormInputProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'form'> & {
    name: TName;
    label?: string;
    className?: string;
    inputClassName?: string;
    hideError?: boolean;
    form: UseZodFormReturn<TFieldValues>;
    description?: string;
};

/**
 * A reusable form input component that combines shadcn UI form components
 * with react-hook-form integration.
 */
export function FormInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    description,
    hideError = false,
    ...inputProps
}: FormInputProps<TFieldValues, TName>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Input {...field} {...inputProps} />
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    {!hideError && <FormMessage />}
                </FormItem>
            )}
        />
    );
}
