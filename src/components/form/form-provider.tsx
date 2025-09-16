'use client';

import { UseZodFormReturn } from '@/components/form/hooks/types';
import { cn } from '@/lib/utils';
import { FormHTMLAttributes } from 'react';
import { FieldValues, FormProvider } from 'react-hook-form';

type FormProps<TFormValues extends FieldValues> = FormHTMLAttributes<HTMLFormElement> & {
    form: UseZodFormReturn<TFormValues>;
};

export function Form<TFormValues extends FieldValues>({
    children,
    form,
    className,
    id,
    ...props
}: FormProps<TFormValues>) {
    // Extract handleSubmit and custom properties from our form hook
    const { handleSubmit, handleNativeSubmit, ...formMethods } = form;

    return (
        <FormProvider {...formMethods} handleSubmit={handleNativeSubmit}>
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
