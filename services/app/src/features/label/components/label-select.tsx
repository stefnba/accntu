'use client';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { useGetLabels } from '@/features/label/api/get-labels';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type {
    FieldPath,
    FieldValues,
    Path,
    PathValue,
    UseFormReturn
} from 'react-hook-form';
import { BiLabel } from 'react-icons/bi';
import { LuCheck, LuChevronsUpDown } from 'react-icons/lu';

import { LabelColorDot } from './label-color-select';

type TLabelItem = {
    name: string;
    color?: string;
};

const LabelItem = ({ name, color }: TLabelItem) => {
    return (
        <div className="flex items-center">
            <BiLabel style={{ color }} className="mr-2 size-4" />
            {name}
        </div>
    );
};

type TOptions<TFieldValues> = {
    label: string;
    value: PathValue<TFieldValues, Path<TFieldValues>>;
}[];

type Props<
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

/**
 * LabelSelect component. Must be wrapped in a form.
 */
export function LabelSelect<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    placeholder,
    description
}: Props<TFieldValues>) {
    const { data, isLoading } = useGetLabels({});
    const [open, setOpen] = useState(false);

    if (isLoading) {
        return <>Loading...</>;
    }

    if (!data) {
        return <>No data</>;
    }

    const options: TOptions<FieldValues> = data.map(({ id, name }) => ({
        value: id,
        label: name
    }));

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <div className="relative">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                'justify-between w-full',
                                                !field.value &&
                                                    'text-muted-foreground'
                                            )}
                                        >
                                            {field.value
                                                ? options.find(
                                                      (o) =>
                                                          o.value ===
                                                          field.value
                                                  )?.label
                                                : placeholder || 'Select'}
                                            <LuChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="p-0">
                                    <Command>
                                        <CommandInput placeholder="Search..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                No Values found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {options.map((o) => (
                                                    <CommandItem
                                                        value={o.value}
                                                        key={o.value}
                                                        onSelect={() => {
                                                            form.setValue(
                                                                name,
                                                                o.value
                                                            );
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        {/* <LuCheck
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                o.value ===
                                                                    field.value
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0'
                                                            )}
                                                        /> */}
                                                        <LabelItem
                                                            name={o.label}
                                                            color={o.value}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
