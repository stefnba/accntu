'use client';

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

type Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
    label?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    form: UseFormReturn<TFieldValues>;
    description?: string;
};

export function FormInput<TFieldValues extends FieldValues>({
    name,
    label,
    type,
    placeholder,
    className,
    form,
    description
}: Props<TFieldValues>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <div className="relative">
                            <Input
                                className={className}
                                type={type}
                                placeholder={placeholder}
                                {...field}
                                disabled={form.formState.isSubmitting}
                                onBlur={async () => {
                                    console.log(await form.trigger(name));
                                    console.log(await form.trigger());
                                }}
                            />
                        </div>
                    </FormControl>
                    {description && (
                        <FormDescription>{description}</FormDescription>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
