import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TLabelQuery } from '@/features/label/schemas';
import { cn } from '@/lib/utils';
import { renderLabelIcon } from '@/lib/utils/icon-renderer';
import { cva, type VariantProps } from 'class-variance-authority';

const labelBadgeVariants = cva('flex-shrink-0 flex items-center gap-2 font-medium', {
    variants: {
        variant: {
            default: '',
            iconOnly: 'gap-0',
        },
        size: {
            sm: 'px-2 py-1 text-xs',
            md: 'px-3 py-1.5 text-sm',
            lg: 'px-4 py-2 text-base',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'md',
    },
});

const iconSizeMap = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
} as const;

interface LabelBadgeProps extends VariantProps<typeof labelBadgeVariants> {
    label: TLabelQuery['select'];
    className?: string;
}

export const LabelBadge = ({ label, className, size, variant }: LabelBadgeProps) => {
    const badge = (
        <Badge
            style={{ backgroundColor: label.color || undefined, color: 'white' }}
            className={cn(labelBadgeVariants({ variant, size, className }))}
        >
            {renderLabelIcon(label.icon, iconSizeMap[size || 'md'])}
            {variant !== 'iconOnly' && label.name}
        </Badge>
    );

    if (variant === 'iconOnly' && label.name) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{badge}</TooltipTrigger>
                <TooltipContent align="center" side="top">
                    {label.name}
                </TooltipContent>
            </Tooltip>
        );
    }

    return badge;
};
