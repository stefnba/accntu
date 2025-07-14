'use client';

import { UseZodFormReturn } from '@/components/form/use-form';
import { cn } from '@/lib/utils';
import { FormHTMLAttributes } from 'react';
import { FormProvider } from 'react-hook-form';

type FormProps<TFormValues extends Record<string, any> = Record<string, any>> =
    FormHTMLAttributes<HTMLFormElement> & {
        form: UseZodFormReturn<TFormValues>;
    };

export function Form<TFormValues extends Record<string, any>>({
    children,
    form,
    className,
    id,
    ...props
}: FormProps<TFormValues>) {
    // Extract handleSubmit and custom properties from our form hook
    const {
        handleSubmit,
        isSubmitting,
        isSubmitSuccessful,
        submitError,
        resetSubmitState,
        handleNativeSubit,
        ...formMethods
    } = form;

    // // Create a form submit handler that uses our custom handleSubmit
    // const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //     await handleSubmit(e);
    // };

    return (
        <FormProvider {...formMethods} handleSubmit={handleNativeSubit}>
            <form
                id={id}
                autoFocus={false}
                noValidate
                className={cn('space-y-6', className)}
                onSubmit={handleSubmit}
                {...props}
            >
                {children}
            </form>
        </FormProvider>
    );
}
