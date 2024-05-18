'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { UseFormReturn } from 'react-hook-form';

interface FormSubmitProps {
    disabled?: boolean;
    className?: string;
    form: UseFormReturn<any>;
    variant?:
        | 'default'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link';
    // | 'primary';
    size?: 'sm' | 'icon' | 'lg' | 'default';
    children?: React.ReactNode;
}

const LoadingDots = () => (
    <div className="flex space-x-[3px] justify-center items-center bg-primary">
        <span className="sr-only">Loading...</span>
        <div className="size-2 bg-white rounded-full animate-bounce [animation-delay:-0.1s]"></div>
        <div className="size-2 bg-white rounded-full animate-bounce [animation-delay:-0.05s]"></div>
        <div className="size-2 bg-white rounded-full animate-bounce"></div>
    </div>
);

export const FormSubmit = ({
    disabled,
    className,
    variant = 'default',
    form,
    size = 'default',
    children
}: FormSubmitProps) => {
    return (
        <Button
            size={size}
            variant={variant}
            disabled={disabled || !form.formState.isValid}
            type="submit"
            className={cn('mt-4', className)}
        >
            {form.formState.isSubmitting ? (
                <LoadingDots />
            ) : (
                children || 'Submit'
            )}
        </Button>
    );
};
