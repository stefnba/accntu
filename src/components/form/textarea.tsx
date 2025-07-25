import { UseZodFormReturn } from '@/components/form/use-form';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { TextareaHTMLAttributes } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';

type FormTextareaProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'form'> & {
    name: TName;
    label?: string;
    className?: string;
    hideError?: boolean;
    form: UseZodFormReturn<TFieldValues>;
    description?: string;
};

export function FormTextarea<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    description,
    hideError = false,
    ...textareaProps
}: FormTextareaProps<TFieldValues, TName>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Textarea {...field} {...textareaProps} />
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    {!hideError && <FormMessage />}
                </FormItem>
            )}
        />
    );
}
