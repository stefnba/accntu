import { UseZodFormReturn } from '@/components/form/hooks';
import { Button, buttonVariants } from '@/components/ui/button';
import { VariantProps } from 'class-variance-authority';
import { FieldValues } from 'react-hook-form';

type FormSubmitButtonProps<
    TFieldValues extends FieldValues = FieldValues,
    TTransformedValues extends FieldValues = TFieldValues,
> = Omit<React.ComponentProps<'button'>, 'type' | 'form'> & {
    form: UseZodFormReturn<TFieldValues, any, TTransformedValues>;
    loadingText?: string;
    disabledBeforeValid?: boolean;
} & Pick<VariantProps<typeof buttonVariants>, 'size' | 'variant'>;

export function FormSubmitButton<
    TFieldValues extends FieldValues = FieldValues,
    TTransformedValues extends FieldValues = TFieldValues,
>({
    form,
    children,
    loadingText = 'Submitting...',
    disabled,
    disabledBeforeValid = true,
    size,
    variant,
    ...buttonProps
}: FormSubmitButtonProps<TFieldValues, TTransformedValues>) {
    const isFormValid = form.formState.isValid;
    const isSubmitting = form.isSubmitting;

    return (
        <Button
            type="submit"
            size={size}
            variant={variant}
            disabled={disabled || isSubmitting || (disabledBeforeValid && !isFormValid)}
            {...buttonProps}
        >
            {isSubmitting ? loadingText : children}
        </Button>
    );
}
