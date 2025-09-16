import { Form } from '@/components/form/form-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useMemo, useState } from 'react';
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

export const useForm = <
    Output extends FieldValues,
    Input extends FieldValues,
    Context = any,
    T extends z.ZodType<Output, Input> = z.ZodType<Output, Input>,
>(
    options: { schema: T; disableOnSubmit?: boolean } & UseZodFormOptions<z.input<T>, z.output<T>>
    // ): UseZodFormReturn<z.input<T>, Context, z.output<T>> => {
) => {
    const { schema, disableOnSubmit = true, ...formOptions } = options;

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
    // Return the enhanced form
    //============================================

    const enhancedForm: UseZodFormReturn<z.input<T>, any, z.output<T>> = useMemo(() => {
        return {
            ...form,
            handleSubmit,
            handleNativeSubmit: form.handleSubmit,
            isSubmitting,
        };
    }, [form, handleSubmit, isSubmitting]);

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
            <FormInput form={enhancedForm} {...props} disabled={disableOnSubmit && isSubmitting} />
        ),
        [enhancedForm]
    );

    const SubmitButtonComponent = useCallback(
        (props: Omit<React.ComponentProps<typeof FormSubmitButton>, 'form'>) => (
            <FormSubmitButton
                form={enhancedForm}
                {...props}
                disabled={disableOnSubmit && isSubmitting}
            />
        ),
        [enhancedForm]
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
                disabled={disableOnSubmit && isSubmitting}
            />
        ),
        [enhancedForm]
    );

    const SelectComponent = useCallback(
        (
            props: Omit<React.ComponentProps<typeof FormSelect>, 'form'> & {
                name: Path<z.input<T>>;
            }
        ) => (
            <FormSelect form={enhancedForm} {...props} disabled={disableOnSubmit && isSubmitting} />
        ),
        [enhancedForm]
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
                disabled={disableOnSubmit && isSubmitting}
            />
        ),
        [enhancedForm]
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
                disabled={disableOnSubmit && isSubmitting}
            />
        ),
        [enhancedForm]
    );

    const SwitchComponent = useCallback(
        (
            props: Omit<React.ComponentProps<typeof FormSwitch>, 'form'> & {
                name: Path<z.input<T>>;
            }
        ) => (
            <FormSwitch form={enhancedForm} {...props} disabled={disableOnSubmit && isSubmitting} />
        ),
        [enhancedForm]
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
                disabled={disableOnSubmit && isSubmitting}
            />
        ),
        [enhancedForm]
    );

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
