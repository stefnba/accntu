'use client';

import { UseZodFormReturn } from '@/components/form/hooks';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { InputHTMLAttributes } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';

type FormOTPInputProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TTransformedValues extends FieldValues = TFieldValues,
> = Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'form'> & {
    name: TName;
    label?: string;
    className?: string;
    inputClassName?: string;
    hideError?: boolean;
    form: UseZodFormReturn<TFieldValues, any, TTransformedValues>;
    description?: string;
};

/**
 * A reusable form input component that combines shadcn UI form components
 * with react-hook-form integration.
 */
export function FormOTPInput<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TTransformedValues extends FieldValues = TFieldValues,
>({
    form,
    name,
    label,
    description,
    hideError = false,
    ...inputProps
}: FormOTPInputProps<TFieldValues, TName, TTransformedValues>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <InputOTP maxLength={8} {...field}>
                            <InputOTPGroup className="flex w-full justify-between">
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                                <InputOTPSlot index={6} />
                                <InputOTPSlot index={7} />
                            </InputOTPGroup>
                        </InputOTP>
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    {!hideError && <FormMessage />}
                </FormItem>
            )}
        />
    );
}
