import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
    FieldValues,
    SubmitErrorHandler,
    SubmitHandler,
    UseFormProps,
    UseFormReturn,
    useForm as useHookForm,
} from 'react-hook-form';
import { z } from 'zod';

/**
 * Enhanced form hook options that extend React Hook Form's options
 */
export interface UseZodFormOptions<TFormValues extends FieldValues>
    extends Omit<UseFormProps<TFormValues>, 'resolver'> {
    /**
     * Optional onSubmit handler for successful form submission
     */
    onSubmit?: SubmitHandler<TFormValues>;

    /**
     * Optional onError handler for form submission errors
     */
    onError?: SubmitErrorHandler<TFormValues>;
}

/**
 * Enhanced form hook return type that extends React Hook Form's return type
 */
export interface UseZodFormReturn<TFormValues extends FieldValues>
    extends Omit<UseFormReturn<TFormValues>, 'handleSubmit'> {
    /**
     * Form submission handler that automatically validates the form
     * and calls the provided onSubmit/onError handlers
     */
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;

    /**
     * Whether the form is currently submitting
     */
    isSubmitting: boolean;

    /**
     * Whether the form has been submitted successfully
     */
    isSubmitSuccessful: boolean;

    /**
     * Form submission error, if any
     */
    submitError: Error | null;

    /**
     * Reset the form submission state
     */
    resetSubmitState: () => void;
}

/**
 * Enhanced form hook that combines Zod schema validation with React Hook Form
 *
 * @param schema - Zod schema for form validation
 * @param options - Form options including default values and submit handlers
 * @returns Enhanced form methods and state
 *
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * const { register, handleSubmit, formState: { errors } } = useZodForm({
 *   schema,
 *   defaultValues: {
 *     email: '',
 *     password: '',
 *   },
 *   onSubmit: (data) => {
 *     console.log('Form submitted:', data);
 *   },
 * });
 * ```
 */
export function useZodForm<TSchema extends z.ZodType<any, any, any>>({
    schema,
    onSubmit,
    onError,
    ...formOptions
}: {
    schema: TSchema;
} & UseZodFormOptions<z.infer<TSchema>>): UseZodFormReturn<z.infer<TSchema>> {
    type FormValues = z.infer<TSchema>;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
    const [submitError, setSubmitError] = useState<Error | null>(null);

    // Initialize the form with Zod resolver
    const form = useHookForm<FormValues>({
        resolver: zodResolver(schema),
        ...formOptions,
    });

    // Create an enhanced submit handler
    const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
        if (e) {
            e.preventDefault();
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await form.handleSubmit(
                async (data) => {
                    if (onSubmit) {
                        await onSubmit(data);
                    }
                    setIsSubmitSuccessful(true);
                },
                async (errors) => {
                    if (onError) {
                        await onError(errors);
                    }
                }
            )(e);
        } catch (error) {
            setSubmitError(error instanceof Error ? error : new Error('An unknown error occurred'));
            setIsSubmitSuccessful(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset submission state
    const resetSubmitState = () => {
        setIsSubmitting(false);
        setIsSubmitSuccessful(false);
        setSubmitError(null);
    };

    return {
        ...form,
        handleSubmit,
        isSubmitting,
        isSubmitSuccessful,
        submitError,
        resetSubmitState,
    };
}

/**
 * Create a type-safe form schema with default values
 *
 * @param schema - Zod schema for form validation
 * @param defaultValues - Default values for the form
 * @returns An object containing the schema and default values
 *
 * @example
 * ```tsx
 * const loginForm = createFormSchema(
 *   z.object({
 *     email: z.string().email(),
 *     password: z.string().min(8),
 *   }),
 *   {
 *     email: '',
 *     password: '',
 *   }
 * );
 *
 * const { register, handleSubmit } = useZodForm(loginForm);
 * ```
 */
export function createFormSchema<TSchema extends z.ZodType<any, any, any>>(
    schema: TSchema,
    defaultValues: z.infer<TSchema>
) {
    return {
        schema,
        defaultValues,
    };
}

/**
 * Legacy hook name for backward compatibility
 * @deprecated Use useZodForm instead
 */
export const useForm = useZodForm;
