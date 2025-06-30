import { UseZodFormReturn } from '@/components/form/use-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { VariantProps } from 'class-variance-authority';
import { FieldValues } from 'react-hook-form';

type FormSubmitButtonProps<TFieldValues extends FieldValues> = Omit<
    React.ComponentProps<'button'>,
    'type' | 'form'
> & {
    form: UseZodFormReturn<TFieldValues>;
    loadingText?: string;
    disabledBeforeValid?: boolean;
} & Pick<VariantProps<typeof buttonVariants>, 'size' | 'variant'>;

export function FormSubmitButton<TFieldValues extends FieldValues>({
    form,
    children,
    loadingText = 'Submitting...',
    disabled,
    disabledBeforeValid = true,
    size,
    variant,
    ...buttonProps
}: FormSubmitButtonProps<TFieldValues>) {
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
