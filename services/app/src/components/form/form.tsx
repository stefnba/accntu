'use client';

import { FormProvider, SubmitHandler, UseFormReturn } from 'react-hook-form';

interface Props {
    children: React.ReactNode;
    form: UseFormReturn<any>;
    /* Action to be performed on form submit */
    onSubmit: SubmitHandler<any>;
    className?: string;
}

export default function Form({ children, form, onSubmit, className }: Props) {
    return (
        <FormProvider {...form}>
            <form
                autoFocus={false}
                noValidate
                className={className}
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {children}
            </form>
        </FormProvider>
    );
}
