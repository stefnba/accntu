import { Badge } from '@/components/ui/badge';
import { TTagQuery } from '@/features/tag/schemas';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagBadgeProps {
    className?: string;
    tag: TTagQuery['select'];
    onClick?: () => void;
    onDelete?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, onClick, onDelete, className }) => {
    return (
        <Badge
            variant="outline"
            className={cn('text-xs text-white border-none group', className)}
            style={{ backgroundColor: tag.color }}
        >
            {tag.name}
            {onDelete && (
                <X
                    className="size-1 rounded-full hidden group-hover:block transition-all"
                    onClick={onDelete}
                />
            )}
        </Badge>
    );
};
