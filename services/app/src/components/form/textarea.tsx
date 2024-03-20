'use client';

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { useFormStatus } from 'react-dom';
import { FieldPath, FieldValues } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import { FormErrors } from './error';

type FormTextareaProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    form: UseFormReturn<TFieldValues>;
    description?: string;
};

export function FormTextarea<TFieldValues extends FieldValues>({
    name,
    label,

    placeholder,
    className,
    form,
    description
}: FormTextareaProps<TFieldValues>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <div className="relative">
                            {/* <div className="absolute right-0 h-full items-center">
                                addd
                            </div> */}
                            <Textarea
                                className={className}
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
