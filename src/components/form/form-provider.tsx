'use client';

import { UseZodFormReturn } from '@/components/form/hooks/types';
import { cn } from '@/lib/utils';
import { FormHTMLAttributes } from 'react';
import { FieldValues, FormProvider } from 'react-hook-form';

type FormProps<
    TFieldValues extends FieldValues = FieldValues,
    TTransformedValues extends FieldValues = TFieldValues,
> = FormHTMLAttributes<HTMLFormElement> & {
    form: UseZodFormReturn<TFieldValues, any, TTransformedValues>;
};

export function Form<
    TFieldValues extends FieldValues = FieldValues,
    TTransformedValues extends FieldValues = TFieldValues,
>({ children, form, className, id, ...props }: FormProps<TFieldValues, TTransformedValues>) {
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
