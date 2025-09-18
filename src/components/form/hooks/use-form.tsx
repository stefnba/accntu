import { Form } from '@/components/form/form-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldValues, Path, useForm as useHookForm } from 'react-hook-form';
import { z } from 'zod/v4';

import { FormCheckbox } from '@/components/form/checkbox';
import { FormInput } from '@/components/form/input';
import { FormOTPInput } from '@/components/form/input-opt';
import { FormRadioGroup } from '@/components/form/radio-group';
import { FormSelect } from '@/components/form/select';
import { FormSubmitButton } from '@/components/form/submit-button';
import { FormSwitch } from '@/components/form/switch';
import { FormTextarea } from '@/components/form/textarea';
import { UseZodFormOptions, UseZodFormReturn } from './types';

/**
 * Deep equality comparison optimized for form data structures
 */
const deepEqual = (obj1: unknown, obj2: unknown): boolean => {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return obj1 === obj2;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

    const keys1 = Object.keys(obj1 as object);
    const keys2 = Object.keys(obj2 as object);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual((obj1 as any)[key], (obj2 as any)[key])) return false;
    }

    return true;
};

export const useForm = <
    Output extends FieldValues,
    Input extends FieldValues,
    Context = any,
    T extends z.ZodType<Output, Input> = z.ZodType<Output, Input>,
>(
    options: { schema: T; disableOnSubmit?: boolean } & UseZodFormOptions<z.input<T>, z.output<T>>
) => {
    const {
        schema,
        disableOnSubmit = true,
        initialData,
        showLoadingState,
        requireChanges = false,
        ...formOptions
    } = options;

    //============================================
    // State
    //============================================

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Track initial data snapshot for change detection
    const initialDataSnapshot = useRef<z.input<T> | null>(null);

    // Determine if we should show loading state
    const shouldShowLoadingState = useMemo(() => {
        if (showLoadingState !== undefined) return showLoadingState;
        // Auto-detect: show loading if initialData is explicitly provided but undefined/null
        return initialData !== undefined && (initialData === null || initialData === undefined);
    }, [showLoadingState, initialData]);

    const isLoading = useMemo(() => {
        return shouldShowLoadingState && (initialData === null || initialData === undefined);
    }, [shouldShowLoadingState, initialData]);

    //============================================
    // Initialize the form
    //============================================

    const form = useHookForm<z.input<T>, Context, z.output<T>>({
        resolver: zodResolver(schema),
        ...formOptions,
    });

    //============================================
    // Dynamic data loading effect
    //============================================

    const getCurrentValues = form.getValues;
    const resetForm = form.reset;

    useEffect(() => {
        // Reset form when initialData becomes available
        if (initialData) {
            const validatedData = schema.safeParse(initialData);

            // If validation fails, don't reset the form
            if (!validatedData.success) {
                console.warn('initialData validation failed:', validatedData.error);
                return;
            }

            const resetData: z.input<T> = {
                ...getCurrentValues(),
                ...initialData,
            };

            // Update snapshot for change detection
            initialDataSnapshot.current = resetData;

            resetForm(resetData);
        }
    }, [initialData, getCurrentValues, resetForm, schema]);

    //============================================
    // Change detection for requireChanges
    //============================================

    // Watch form values for change detection
    const currentValues = form.watch();

    // Check if form has changes compared to initial data
    const hasChanges = useMemo(() => {
        if (!requireChanges || !initialDataSnapshot.current) {
            return true; // No requirement to check changes
        }
        return !deepEqual(currentValues, initialDataSnapshot.current);
    }, [currentValues, requireChanges]);

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
    // Return the enhanced form
    //============================================

    const enhancedForm: UseZodFormReturn<z.input<T>, any, z.output<T>> = useMemo(() => {
        return {
            ...form,
            handleSubmit,
            handleNativeSubmit: form.handleSubmit,
            isSubmitting,
            isLoading,
            hasChanges,
            formState: {
                ...form.formState,
                isValid: form.formState.isValid && (!requireChanges || hasChanges),
            },
        };
    }, [form, handleSubmit, isSubmitting, isLoading, hasChanges, requireChanges]);

    //============================================
    // Enhanced components with form binding
    //============================================

    const FormComponent = useCallback(
        (props: Omit<React.ComponentProps<typeof Form>, 'form'>) => (
            <Form form={enhancedForm} {...props} />
        ),
        [enhancedForm]
    );

    const InputComponent = useCallback(
        (
            props: Omit<React.ComponentProps<typeof FormInput>, 'form'> & {
                name: Path<z.input<T>>;
            }
        ) => (
            <FormInput
                form={enhancedForm}
                {...props}
                disabled={props.disabled || (disableOnSubmit && isSubmitting) || isLoading}
            />
        ),
        [enhancedForm, isLoading, isSubmitting, disableOnSubmit]
    );

    const SubmitButtonComponent = useCallback(
        (props: Omit<React.ComponentProps<typeof FormSubmitButton>, 'form'>) => (
            <FormSubmitButton
                form={enhancedForm}
                {...props}
                disabled={props.disabled || (disableOnSubmit && isSubmitting) || isLoading}
            />
        ),
        [enhancedForm, isLoading, isSubmitting, disableOnSubmit]
    );

    const TextareaComponent = useCallback(
        (
            props: Omit<React.ComponentProps<typeof FormTextarea>, 'form'> & {
                name: Path<z.input<T>>;
            }
        ) => (
            <FormTextarea
                form={enhancedForm}
                {...props}
                disabled={props.disabled || (disableOnSubmit && isSubmitting) || isLoading}
            />
        ),
        [enhancedForm, isLoading, isSubmitting, disableOnSubmit]
    );

    const SelectComponent = useCallback(
        (
            props: Omit<React.ComponentProps<typeof FormSelect>, 'form'> & {
                name: Path<z.input<T>>;
            }
        ) => (
            <FormSelect
                form={enhancedForm}
                {...props}
                disabled={props.disabled || (disableOnSubmit && isSubmitting) || isLoading}
            />
        ),
        [enhancedForm, isLoading, isSubmitting, disableOnSubmit]
    );

    const CheckboxComponent = useCallback(
        (
            props: Omit<React.ComponentProps<typeof FormCheckbox>, 'form'> & {
                name: Path<z.input<T>>;
            }
        ) => (
            <FormCheckbox
                form={enhancedForm}
                {...props}
                disabled={props.disabled || (disableOnSubmit && isSubmitting) || isLoading}
            />
        ),
        [enhancedForm, isLoading, isSubmitting, disableOnSubmit]
    );

    const RadioGroupComponent = useCallback(
        (
            props: Omit<React.ComponentProps<typeof FormRadioGroup>, 'form'> & {
                name: Path<z.input<T>>;
            }
        ) => (
            <FormRadioGroup
                form={enhancedForm}
                {...props}
                disabled={props.disabled || (disableOnSubmit && isSubmitting) || isLoading}
            />
        ),
        [enhancedForm, isLoading, isSubmitting, disableOnSubmit]
    );

    const SwitchComponent = useCallback(
        (
            props: Omit<React.ComponentProps<typeof FormSwitch>, 'form'> & {
                name: Path<z.input<T>>;
            }
        ) => (
            <FormSwitch
                form={enhancedForm}
                {...props}
                disabled={props.disabled || (disableOnSubmit && isSubmitting) || isLoading}
            />
        ),
        [enhancedForm, isLoading, isSubmitting, disableOnSubmit]
    );

    const OTPInputComponent = useCallback(
        (
            props: Omit<React.ComponentProps<typeof FormOTPInput>, 'form'> & {
                name: Path<z.input<T>>;
            }
        ) => (
            <FormOTPInput
                form={enhancedForm}
                {...props}
                disabled={props.disabled || (disableOnSubmit && isSubmitting) || isLoading}
            />
        ),
        [enhancedForm, isLoading, isSubmitting, disableOnSubmit]
    );

    //============================================
    // Return
    //============================================

    return {
        form: enhancedForm,
        // Components
        Form: FormComponent,
        Input: InputComponent,
        Textarea: TextareaComponent,
        SubmitButton: SubmitButtonComponent,
        Select: SelectComponent,
        Checkbox: CheckboxComponent,
        RadioGroup: RadioGroupComponent,
        Switch: SwitchComponent,
        OTPInput: OTPInputComponent,
    };
};
