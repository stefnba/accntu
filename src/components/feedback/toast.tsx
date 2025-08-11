import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { AlertCircleIcon, AlertTriangle, Check, Info, X, XIcon } from 'lucide-react';
import * as React from 'react';
import { toast as hotToast, Toast as HotToast, ToasterProps } from 'react-hot-toast';

export type TToastPosition = ToasterProps['position'];

// Toast variants using CVA for consistent styling
const toastVariants = cva(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
    {
        variants: {
            variant: {
                default: 'border bg-background text-foreground',
                success:
                    'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100',
                error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100',
                warning:
                    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100',
                info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const toastIconVariants = cva('h-5 w-5 flex-shrink-0', {
    variants: {
        variant: {
            default: 'text-foreground',
            success: 'text-green-600 dark:text-green-400',
            error: 'text-red-600 dark:text-red-400',
            warning: 'text-amber-600 dark:text-amber-400',
            info: 'text-blue-600 dark:text-blue-400',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

interface ToastProps extends VariantProps<typeof toastVariants> {
    title: string;
    description?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
    dismissible?: boolean;
    duration?: number;
    onDismiss?: () => void;
}

interface CustomToastProps extends ToastProps {
    t: HotToast;
}

const getDefaultIcon = (variant: ToastProps['variant']) => {
    switch (variant) {
        case 'success':
            return <Check />;
        case 'error':
            return <X />;
        case 'warning':
            return <AlertTriangle />;
        case 'info':
            return <Info />;
        default:
            return <AlertCircleIcon />;
    }
};

const CustomToast = ({
    t,
    variant = 'default',
    title,
    description,
    action,
    icon,
    dismissible = true,
    onDismiss,
}: CustomToastProps) => {
    const displayIcon = icon || getDefaultIcon(variant);

    const handleDismiss = () => {
        hotToast.dismiss(t.id);
        onDismiss?.();
    };

    return (
        <div
            className={cn(
                toastVariants({ variant }),
                'max-w-md',
                t.visible ? 'animate-enter' : 'animate-leave'
            )}
        >
            <div
                className={cn(
                    'flex gap-3',
                    // Center content when only title (no description or action)
                    !description && !action ? 'items-center' : 'items-start'
                )}
            >
                {displayIcon && (
                    <div className={cn(toastIconVariants({ variant }), 'mt-0.5')}>
                        {displayIcon}
                    </div>
                )}
                <div
                    className={cn(
                        'flex-1',
                        // Center text when only title
                        !description && !action ? 'text-center' : 'space-y-1'
                    )}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    {description && (
                        <div className="text-sm opacity-90 leading-relaxed">{description}</div>
                    )}
                    {action && <div className="mt-2">{action}</div>}
                </div>
            </div>
            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
                    aria-label="Close toast"
                >
                    <XIcon className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

// Toast API functions
const createToast = (props: ToastProps, options?: { position?: TToastPosition }) => {
    return hotToast.custom((t) => <CustomToast t={t} {...props} />, {
        duration: props.duration || 4000,
        position: options?.position || 'bottom-right',
    });
};

export const successToast = (
    title: string,
    description?: string,
    options?: { action?: React.ReactNode; duration?: number; position?: TToastPosition }
) => {
    return createToast(
        {
            variant: 'success',
            title,
            description,
            action: options?.action,
            duration: options?.duration,
        },
        { position: options?.position }
    );
};

export const errorToast = (
    title: string,
    description?: string,
    options?: { action?: React.ReactNode; duration?: number; position?: TToastPosition }
) => {
    return createToast(
        {
            variant: 'error',
            title,
            description,
            action: options?.action,
            duration: options?.duration || 6000, // Longer duration for errors
        },
        { position: options?.position }
    );
};

export const warningToast = (
    title: string,
    description?: string,
    options?: { action?: React.ReactNode; duration?: number; position?: TToastPosition }
) => {
    return createToast(
        {
            variant: 'warning',
            title,
            description,
            action: options?.action,
            duration: options?.duration || 5000,
        },
        { position: options?.position }
    );
};

export const infoToast = (
    title: string,
    description?: string,
    options?: { action?: React.ReactNode; duration?: number; position?: TToastPosition }
) => {
    return createToast(
        {
            variant: 'info',
            title,
            description,
            action: options?.action,
            duration: options?.duration,
        },
        { position: options?.position }
    );
};

export const defaultToast = (
    title: string,
    description?: string,
    options?: {
        action?: React.ReactNode;
        duration?: number;
        position?: TToastPosition;
        icon?: React.ReactNode;
    }
) => {
    return createToast(
        {
            variant: 'default',
            title,
            description,
            action: options?.action,
            duration: options?.duration,
            icon: options?.icon,
        },
        { position: options?.position }
    );
};

// Promise toast for async operations
export const promiseToast = <T,>(
    promise: Promise<T>,
    {
        loading,
        success,
        error,
        position,
    }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
        position?: TToastPosition;
    }
) => {
    return hotToast.promise(
        promise,
        {
            loading: loading,
            success: (data) => {
                const message = typeof success === 'function' ? success(data) : success;
                return message;
            },
            error: (err) => {
                const message = typeof error === 'function' ? error(err) : error;
                return message;
            },
        },
        {
            position: position || 'bottom-right',
        }
    );
};

// Main toast object with all methods
export const toast = {
    success: successToast,
    error: errorToast,
    warning: warningToast,
    info: infoToast,
    default: defaultToast,
    promise: promiseToast,
    dismiss: hotToast.dismiss,
    remove: hotToast.remove,
    loading: (title: string, options?: { position?: TToastPosition }) =>
        hotToast.loading(title, { position: options?.position || 'bottom-right' }),
};

// Export types for external use
export { toastIconVariants, toastVariants };
export type { ToastProps };
