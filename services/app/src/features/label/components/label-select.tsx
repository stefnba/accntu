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
import { useGetAllLabels } from '@/features/label/api/get-all-labels';
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
    color: string | null;
};

const LabelItem = ({ name, color }: TLabelItem) => {
    return (
        <div className="flex items-center">
            <BiLabel
                style={{ color: color || 'black' }}
                className="mr-2 size-4"
            />
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
export function LabelSelectWithForm<TFieldValues extends FieldValues>({
    form,
    name,
    label,
    placeholder,
    description
}: Props<TFieldValues>) {
    const { data, isLoading } = useGetAllLabels();
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
                                    <LabelSelectCommand
                                        handleSelect={(labelId) => {
                                            form.setValue(
                                                name,
                                                labelId as PathValue<
                                                    TFieldValues,
                                                    Path<TFieldValues>
                                                >
                                            );
                                            setOpen(false);
                                        }}
                                    />
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

interface LabelSelectProps {
    handleSelect: (labelId: string) => void;
    children: React.ReactNode;
}

export const LabelSelectPopover = ({
    handleSelect,
    children
}: LabelSelectProps) => {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent align="start" className="p-0">
                <LabelSelectCommand
                    handleSelect={(labelId) => {
                        handleSelect(labelId);
                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
};

interface LabelSelectCommandProps {
    handleSelect: (labelId: string) => void;
}

/**
 * Main Command component for selecting labels. It fetches the labels and displays them in a command list.
 */
export const LabelSelectCommand: React.FC<LabelSelectCommandProps> = ({
    handleSelect
}) => {
    const { data: labels = [], isLoading } = useGetAllLabels();

    return (
        <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
                <CommandEmpty>No Values found.</CommandEmpty>
                <CommandGroup>
                    {labels.map((l) => {
                        const { name, level, parentLabel, rootParent } = l;

                        const labelName = () => {
                            if (level === 0) {
                                return name;
                            }

                            if (level === 1) {
                                return `${parentLabel?.name} > ${name}`;
                            }
                            if (level === 2) {
                                return `${rootParent?.name} > ${parentLabel?.name} > ${name}`;
                            }

                            return `${rootParent?.name} > ... > ${parentLabel?.name} > ${name}`;
                        };

                        return (
                            <CommandItem
                                className="cursor-pointer"
                                value={l.id}
                                key={l.id}
                                onSelect={() => {
                                    handleSelect(l.id);
                                }}
                            >
                                <LabelItem name={labelName()} color={l.color} />
                            </CommandItem>
                        );
                    })}
                </CommandGroup>
            </CommandList>
        </Command>
    );
};
