import { Button } from '@/components/ui/button';
import { UseZodFormReturn } from '@/hooks/use-form';
import { FieldValues } from 'react-hook-form';

type FormSubmitButtonProps<TFieldValues extends FieldValues> = Omit<
    React.ComponentProps<'button'>,
    'type' | 'form'
> & {
    form: UseZodFormReturn<TFieldValues>;
    loadingText?: string;
    disabledBeforeValid?: boolean;
};

export function FormSubmitButton<TFieldValues extends FieldValues>({
    form,
    children,
    loadingText = 'Submitting...',
    disabled,
    disabledBeforeValid = true,
    ...buttonProps
}: FormSubmitButtonProps<TFieldValues>) {
    const isFormValid = form.formState.isValid;
    const isSubmitting = form.isSubmitting;

    return (
        <Button
            type="submit"
            disabled={disabled || isSubmitting || (disabledBeforeValid && !isFormValid)}
            {...buttonProps}
        >
            {isSubmitting ? loadingText : children}
        </Button>
    );
}
