'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    options: FormRadioItemProps[];
};

interface FormRadioItemProps {
    label: string;
    value: any;
    itemClassName?: string;
    labelClassName?: string;
}

const FormRadioItem = ({
    label,
    value,
    itemClassName,
    labelClassName
}: FormRadioItemProps) => {
    return (
        <FormItem className="flex items-center space-x-3 space-y-0 cursor-pointer">
            <FormControl>
                <RadioGroupItem value={value} />
            </FormControl>
            <FormLabel className="font-normal cursor-pointer">
                {label}
            </FormLabel>
        </FormItem>
    );
};

export function FormRadio<TFieldValues extends FieldValues>({
    name,
    options,
    label,
    form
}: Props<TFieldValues>) {
    if (!options || !options.length) {
        return null;
    }

    const optionRender = options.map(({ label, value }) => (
        <FormRadioItem key={value} label={label} value={value} />
    ));

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="space-y-3">
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                        >
                            {optionRender}
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
