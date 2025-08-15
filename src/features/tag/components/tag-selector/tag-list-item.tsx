'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { TTagQuery } from '@/features/tag/schemas';
import { cn } from '@/lib/utils';

interface TagListItemProps {
    tag: TTagQuery['select'];
    isSelected: boolean;
    onToggle: (tagId: string) => void;
    searchTerm: string;
}

export const TagListItem = ({ tag, isSelected, onToggle, searchTerm }: TagListItemProps) => {
    const isHighlighted = searchTerm && tag.name.toLowerCase().includes(searchTerm.toLowerCase());

    return (
        <div
            className={cn(
                'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50',
                isSelected && 'bg-blue-50 border-blue-200',
                isHighlighted && !isSelected && 'bg-yellow-50 border-yellow-200'
            )}
            onClick={() => onToggle(tag.id)}
        >
            <Checkbox
                checked={isSelected}
                onChange={() => onToggle(tag.id)}
                className="pointer-events-none"
            />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className="text-sm text-white border-none"
                        style={{ backgroundColor: tag.color }}
                    >
                        {tag.name}
                    </Badge>
                </div>
            </div>
        </div>
    );
};
