import {
    FieldValues,
    SubmitErrorHandler,
    SubmitHandler,
    UseFormProps,
    UseFormReturn,
} from 'react-hook-form';

/**
 * Enhanced form hook options that extend React Hook Form's options
 */
export interface UseZodFormOptions<
    TFieldValues extends FieldValues,
    TTransformedValues = TFieldValues,
> extends Omit<UseFormProps<TFieldValues, any, TTransformedValues>, 'resolver'> {
    /**
     * Optional onSubmit handler for successful form submission
     */
    onSubmit?: SubmitHandler<TTransformedValues>;

    /**
     * Optional onError handler for form submission errors
     */
    onError?: SubmitErrorHandler<TFieldValues>;
}

/**
 * Enhanced form hook return type that extends React Hook Form's return type
 */
export interface UseZodFormReturn<
    TFormValues extends FieldValues,
    Context = any,
    TTransformedValues = TFormValues,
> extends Omit<UseFormReturn<TFormValues, Context, TTransformedValues>, 'handleSubmit'> {
    /**
     * Form submission handler that automatically validates the form
     * and calls the provided onSubmit/onError handlers
     */
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;

    /**
     * Native React Hook Form handleSubmit for backward compatibility
     */
    handleNativeSubmit: UseFormReturn<TFormValues, Context, TTransformedValues>['handleSubmit'];

    /**
     * Whether the form is currently submitting
     */
    isSubmitting: boolean;

    /**
     * Whether the form has been submitted successfully
     */
    // isSubmitSuccessful: boolean;

    /**
     * Form submission error, if any
     */
    // submitError: Error | null;

    /**
     * Reset the form submission state
     */
    // resetSubmitState: () => void;
}
