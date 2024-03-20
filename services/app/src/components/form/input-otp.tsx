'use client';

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot
} from '@/components/ui/input-otp';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

type Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
    label?: string;
    length?: number;
    className?: string;
    form: UseFormReturn<TFieldValues>;
    description?: string;
};

export default function FormInputOTP<TFieldValues extends FieldValues>({
    name,
    label,
    className,
    length = 8,
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
                            <InputOTP maxLength={length} {...field}>
                                <InputOTPGroup>
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
