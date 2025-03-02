import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseZodFormReturn } from '@/hooks/use-form';
import { FieldPath, FieldValues } from 'react-hook-form';

type FormSwitchProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    form: UseZodFormReturn<TFieldValues>;
    name: TName;
    label: string;
    description?: string;
    hideError?: boolean;
    disabled?: boolean;
    className?: string;
};

export function FormSwitch<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    form,
    name,
    label,
    description,
    hideError = false,
    disabled,
    className,
}: FormSwitchProps<TFieldValues, TName>) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={`flex flex-row items-center justify-between ${className}`}>
                    <div className="space-y-0.5">
                        <FormLabel>{label}</FormLabel>
                        {description && <FormDescription>{description}</FormDescription>}
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                        />
                    </FormControl>
                    {!hideError && <FormMessage />}
                </FormItem>
            )}
        />
    );
}
