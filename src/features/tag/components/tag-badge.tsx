import { Badge } from '@/components/ui/badge';
import { TTagQuery } from '@/features/tag/schemas';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cva, type VariantProps } from 'class-variance-authority';

export const tagBadgeVariants = cva(
    'inline-flex items-center gap-1 rounded-sm text-white transition-colors group border',
    {
        variants: {
            size: {
                sm: 'px-1.5 py-0.5 text-xs h-5',
                md: 'px-2 py-1 text-sm h-6',
                lg: 'px-3 py-1.5 text-base h-8',
            },
        },
        defaultVariants: {
            size: 'sm',
        },
    }
);

interface TagBadgeProps {
    className?: string;
    tag: TTagQuery['select'];
    onClick?: () => void;
    onDelete?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps & VariantProps<typeof tagBadgeVariants>> = ({
    tag,
    onClick,
    onDelete,
    className,
    size,
}) => {
    return (
        <Badge
            variant="secondary"
            className={cn(tagBadgeVariants({ size }), className)}
            style={{
                backgroundColor: `${tag.color}20`,
                borderColor: `${tag.color}80`,
                color: tag.color,
                transition: 'background-color 0.2s',
            }}
            // onMouseEnter={(e) => {
            //     e.currentTarget.style.backgroundColor = `${tag.color}40`;
            // }}
            // onMouseLeave={(e) => {
            //     e.currentTarget.style.backgroundColor = `${tag.color}20`;
            // }}
        >
            {tag.name}
            {onDelete && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="link"
                            size="icon"
                            onClick={onDelete}
                            className="p-0.5 m-0 ml-1 size-3 hover:bg-transparent cursor-pointer"
                            style={{
                                backgroundColor: `${tag.color}60`,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${tag.color}`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = `${tag.color}60`;
                            }}
                        >
                            <X className="size-2.5 text-white rounded-full cursor-pointer transition-all" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove '{tag.name}'</TooltipContent>
                </Tooltip>
            )}
        </Badge>
    );
};
