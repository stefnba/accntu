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
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import type {
    FieldPath,
    FieldValues,
    Path,
    PathValue,
    UseFormReturn
} from 'react-hook-form';

import { Button } from '../ui/button';

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
    options: {
        label: string | React.ReactNode;
        value: string;
    }[];
};

export function FormCombobox<TFieldValues extends FieldValues>({
    name,
    label,
    options,
    className,
    placeholder,
    form,
    description
}: Props<TFieldValues>) {
    const [open, setOpen] = useState(false);

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
                                            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
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
                                                                o.value as PathValue<
                                                                    TFieldValues,
                                                                    Path<TFieldValues>
                                                                >
                                                            );
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                'mr-2 h-4 w-4',
                                                                o.value ===
                                                                    field.value
                                                                    ? 'opacity-100'
                                                                    : 'opacity-0'
                                                            )}
                                                        />
                                                        {o.label}
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
