import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FieldValues, useForm as useHookForm } from 'react-hook-form';
import { z } from 'zod/v4';

import { UseZodFormOptions, UseZodFormReturn } from './types';

export const useForm = <
    Output extends FieldValues,
    Input extends FieldValues,
    Context = any,
    T extends z.ZodType<Output, Input> = z.ZodType<Output, Input>,
>(
    options: { schema: T } & UseZodFormOptions<z.input<T>, z.output<T>>
): UseZodFormReturn<z.input<T>, Context, z.output<T>> => {
    const { schema, ...formOptions } = options;

    //============================================
    // State
    //============================================

    const [isSubmitting, setIsSubmitting] = useState(false);

    //============================================
    // Initialize the form
    //============================================

    const form = useHookForm<z.input<T>, Context, z.output<T>>({
        resolver: zodResolver(schema),
        ...formOptions,
    });

    //============================================
    // Handle form submission
    //============================================

    /**
     * Form submission handler that automatically validates the form
     * and calls the provided onSubmit/onError handlers
     */
    const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
        if (e) {
            e.preventDefault();
        }

        setIsSubmitting(true);

        try {
            await form.handleSubmit(
                async (data) => {
                    if (formOptions.onSubmit) {
                        await formOptions.onSubmit(data);
                    }
                    // setIsSubmitSuccessful(true);
                },
                async (errors) => {
                    if (formOptions.onError) {
                        await formOptions.onError(errors);
                    }
                }
            )(e);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    //============================================
    // Return the form
    //============================================

    return {
        ...form,
        handleSubmit,
        handleNativeSubmit: form.handleSubmit,
        isSubmitting,
    };
};
