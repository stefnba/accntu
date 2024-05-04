'use client';

import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

import { DatePicker } from '../ui/data-picker';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '../ui/form';

interface Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
    name: TName;
    label?: string;
    className?: string;
    form: UseFormReturn<TFieldValues>;
    description?: string;
}

export function FormDatePicker<TFieldValues extends FieldValues>({
    name,
    form,
    description,
    label
}: Props<TFieldValues>) {
    return (
        <FormField
            name={name}
            control={form.control}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <DatePicker />
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
