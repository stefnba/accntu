'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
     * Native React Hook Form handleSubmit for backward compatibility
     */
    handleNativeSubit: UseFormReturn<TFormValues>['handleSubmit'];

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

    // Stabilize defaultValues to prevent unnecessary re-renders from object recreation
    const { defaultValues, ...restFormOptions } = formOptions;
    const stableDefaultValues = useMemo(() => {
        // If we have defaultValues, use them
        if (defaultValues) {
            return defaultValues;
        }

        // If no defaultValues provided, generate them from the schema to ensure controlled inputs
        return generateDefaultValues(schema);
    }, [JSON.stringify(defaultValues), schema]);

    // Initialize the form with Zod resolver and stable default values
    const form = useHookForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: stableDefaultValues,
        ...restFormOptions,
    });

    // Handle dynamic default values updates
    const hasInitialized = useRef(false);
    const previousDefaultValues = useRef(stableDefaultValues);

    useEffect(() => {
        // Skip the first render to avoid resetting initial values
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            previousDefaultValues.current = stableDefaultValues;
            return;
        }

        // Only reset if the stable values actually changed
        if (stableDefaultValues && stableDefaultValues !== previousDefaultValues.current) {
            form.reset(stableDefaultValues);
            previousDefaultValues.current = stableDefaultValues;
        }
    }, [stableDefaultValues, form]);

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
        handleNativeSubit: form.handleSubmit,
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
 * Create a form that can be used to upsert a resource
 *
 * @param create - The create schema and options
 * @param update - The update schema and options
 * @param isUpdate - Whether the form is for an update
 *
 * @example
 * ```tsx
 * const form = useUpsertForm({
 *   create: {
 *     schema: z.object({ name: z.string() }),
 *     onSubmit: (data) => {
 *       console.log(data);
 *     },
 *   },
 *   update: {
 *     schema: z.object({ name: z.string() }),
 *     onSubmit: (data) => {
 *       console.log(data);
 *     },
 *   },
 *   isUpdate: false,
 * });
 */
export const useUpsertForm = <
    TCreateSchema extends z.ZodObject<any>,
    TUpdateSchema extends z.ZodObject<any>,
>({
    create,
    update,
    isUpdate,
}: {
    create: {
        schema: TCreateSchema;
    } & UseZodFormOptions<z.infer<TCreateSchema>>;
    update: {
        schema: TUpdateSchema;
    } & UseZodFormOptions<z.infer<TUpdateSchema>>;
    isUpdate: boolean;
}): UseZodFormReturn<z.infer<TCreateSchema> | z.infer<TUpdateSchema>> =>
    useZodForm<TCreateSchema | TUpdateSchema>(isUpdate ? update : create);

/**
 * Generate default values for a Zod schema
 *
 * @param schema - Zod schema to generate default values for
 * @returns Default values for the schema
 */
const generateDefaultValues = (schema: z.ZodType<any, any, any>) => {
    console.log('schema', schema._def.shape());

    try {
        // Get the schema shape to generate default values
        if (schema._def && schema._def.shape) {
            const schemaShape = schema._def.shape();
            const generatedDefaults: any = {};

            Object.keys(schemaShape).forEach((key) => {
                const field = schemaShape[key];

                // Generate appropriate default values based on field type
                if (field._def.typeName === 'ZodString') {
                    generatedDefaults[key] = '';
                } else if (field._def.typeName === 'ZodNumber') {
                    generatedDefaults[key] = 0;
                } else if (field._def.typeName === 'ZodBoolean') {
                    generatedDefaults[key] = false;
                } else if (field._def.typeName === 'ZodArray') {
                    generatedDefaults[key] = [];
                } else if (
                    field._def.typeName === 'ZodOptional' ||
                    field._def.typeName === 'ZodNullable'
                ) {
                    // For optional/nullable fields, check the inner type
                    const innerType = field._def.innerType || field._def.type;
                    if (innerType._def.typeName === 'ZodString') {
                        generatedDefaults[key] = '';
                    } else if (innerType._def.typeName === 'ZodNumber') {
                        generatedDefaults[key] = 0;
                    } else if (innerType._def.typeName === 'ZodBoolean') {
                        generatedDefaults[key] = false;
                    } else {
                        generatedDefaults[key] = null;
                    }
                } else {
                    // Default fallback for unknown types
                    generatedDefaults[key] = null;
                }
            });

            return generatedDefaults;
        }
    } catch (error) {
        console.warn('Could not generate default values from schema:', error);
    }

    // Fallback to undefined if we can't parse the schema
    return undefined;
};
