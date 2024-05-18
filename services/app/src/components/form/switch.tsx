'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

type Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
    disabled?: boolean;
    className?: string;
    form: UseFormReturn<TFieldValues>;
    label?: string;
};

export function FormSwitch<TFieldValues extends FieldValues>({
    name,
    label,
    form,
    disabled
}: Props<TFieldValues>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="space-y-3">
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
