import { UseZodFormReturn } from '@/components/form/hooks/use-form';
import { Button } from '@/components/ui/button';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { FieldPath, FieldValues } from 'react-hook-form';

type ColorOption = {
    label: string;
    value: string;
};

/**
 * Default color options based on common UI colors
 */
export const defaultColorOptions: ColorOption[] = [
    { label: 'Red', value: '#EF4444' },
    { label: 'Orange', value: '#F97316' },
    { label: 'Amber', value: '#F59E0B' },
    { label: 'Yellow', value: '#EAB308' },
    { label: 'Lime', value: '#84CC16' },
    { label: 'Green', value: '#22C55E' },
    { label: 'Emerald', value: '#10B981' },
    { label: 'Cyan', value: '#06B6D4' },
    { label: 'Blue', value: '#3B82F6' },
    { label: 'Indigo', value: '#6366F1' },
    { label: 'Violet', value: '#8B5CF6' },
    { label: 'Purple', value: '#A855F7' },
    { label: 'Pink', value: '#EC4899' },
    { label: 'Rose', value: '#F43F5E' },
    { label: 'Gray', value: '#6B7280' },
];

type FormColorSelectProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    form: UseZodFormReturn<TFieldValues>;
    name: TName;
    label?: string;
    description?: string;
    colors?: ColorOption[];
    hideError?: boolean;
    className?: string;
    disabled?: boolean;
    cols?: number;
    showClear?: boolean;
};

export function FormColorSelect<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    description,
    colors = defaultColorOptions,
    hideError = false,
    className,
    disabled,
    cols,
    showClear = false,
}: FormColorSelectProps<TFieldValues, TName>) {
    // Add clear option to colors if showClear is true
    const colorsWithClear = showClear ? [...colors, { label: 'Clear', value: '' }] : colors;

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormControl>
                        <TooltipProvider>
                            <div
                                className={cn(
                                    'grid gap-2 max-w-fit',
                                    cols
                                        ? ''
                                        : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-15'
                                )}
                                style={
                                    cols
                                        ? { gridTemplateColumns: `repeat(${cols}, 1fr)` }
                                        : undefined
                                }
                            >
                                {colorsWithClear.map((color) => {
                                    const isSelected = field.value === color.value;
                                    const isClearOption = color.value === '';

                                    return (
                                        <Tooltip key={color.value || 'clear'}>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        field.onChange(color.value);
                                                    }}
                                                    disabled={disabled}
                                                    className={cn(
                                                        'relative h-10 w-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md p-0',
                                                        isSelected && 'border-gray-900 scale-105',
                                                        isClearOption &&
                                                            'border-dashed border-gray-400 bg-transparen'
                                                    )}
                                                    style={
                                                        isClearOption
                                                            ? undefined
                                                            : {
                                                                  backgroundColor: color.value,
                                                                  borderColor: !isSelected
                                                                      ? color.value
                                                                      : undefined,
                                                              }
                                                    }
                                                    aria-label={`Select color ${color.label}`}
                                                    aria-pressed={isSelected}
                                                >
                                                    {isClearOption ? (
                                                        <X className="size-5 text-gray-600" />
                                                    ) : (
                                                        isSelected && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Check className="size-6 text-white drop-shadow-sm" />
                                                            </div>
                                                        )
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{color.label}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </TooltipProvider>
                    </FormControl>
                    {!hideError && <FormMessage />}
                </FormItem>
            )}
        />
    );
}

// Export the component with a shorter name for convenience
export const ColorSelect = FormColorSelect;
