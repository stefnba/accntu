import { UseZodFormReturn } from '@/components/form/use-form';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FieldPath, FieldValues } from 'react-hook-form';

type RadioOption = {
    label: string;
    value: string;
    description?: string;
};

type FormRadioGroupProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    form: UseZodFormReturn<TFieldValues>;
    name: TName;
    label?: string;
    description?: string;
    options: RadioOption[];
    hideError?: boolean;
    className?: string;
    disabled?: boolean;
};

export function FormRadioGroup<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    description,
    options,
    hideError = false,
    className,
    disabled,
}: FormRadioGroupProps<TFieldValues, TName>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormControl>
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                            className="space-y-1"
                            disabled={disabled}
                        >
                            {options.map((option) => (
                                <FormItem
                                    key={option.value}
                                    className="flex items-center space-x-3 space-y-0"
                                >
                                    <FormControl>
                                        <RadioGroupItem value={option.value} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="font-normal">
                                            {option.label}
                                        </FormLabel>
                                        {option.description && (
                                            <FormDescription>{option.description}</FormDescription>
                                        )}
                                    </div>
                                </FormItem>
                            ))}
                        </RadioGroup>
                    </FormControl>
                    {!hideError && <FormMessage />}
                </FormItem>
            )}
        />
    );
}
