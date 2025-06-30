import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { ReactNode } from 'react';

const alertVariants = cva(
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
    {
        variants: {
            variant: {
                default: 'bg-background text-foreground',
                success: 'border-green-400 bg-green-100 text-green-700',
                error: 'border-red-400 bg-red-100 text-red-700',
                warning: 'border-yellow-400 bg-yellow-100 text-yellow-700',
                info: 'border-blue-400 bg-blue-100 text-blue-700',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const iconMap = {
    default: Info,
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

export interface FeedbackAlertProps extends VariantProps<typeof alertVariants> {
    children: ReactNode;
    className?: string;
    icon?: boolean;
}

export function FeedbackAlert({
    children,
    variant = 'default',
    className,
    icon = true,
}: FeedbackAlertProps) {
    const Icon = variant ? iconMap[variant] : iconMap.default;

    return (
        <div className={cn(alertVariants({ variant }), className)} role="alert">
            {icon && <Icon className="h-4 w-4" />}
            <div>{children}</div>
        </div>
    );
}
