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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import React from 'react';
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

import { Button } from '../ui/button';

type TSelectOptions = {
    value: string;
    label: string;
}[];

type Props<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
    label?: string;
    options: TSelectOptions | React.ReactNode;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    form: UseFormReturn<TFieldValues>;
    description?: string;
};

export function FormSelect<TFieldValues extends FieldValues>({
    name,
    label,
    placeholder,
    className,
    options,
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
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger ref={field.ref}>
                                        <SelectValue
                                            placeholder={placeholder}
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Array.isArray(options)
                                        ? options.map((o) => (
                                              <SelectItem
                                                  key={o.value}
                                                  value={o.value}
                                              >
                                                  {o.label}
                                              </SelectItem>
                                          ))
                                        : options}
                                    <Button
                                        className="w-full px-2"
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => {
                                            form.resetField(name, undefined);
                                            e.stopPropagation();
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </SelectContent>
                            </Select>
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
