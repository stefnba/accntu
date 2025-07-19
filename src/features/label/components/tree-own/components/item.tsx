import { Button } from '@/components/ui/button';
import { useSortableTree } from '@/features/label/components/tree-own/hooks';
import { FlattenedItem } from '@/features/label/components/tree-own/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { memo, useMemo } from 'react';

interface TreeItemProps {
    item: FlattenedItem;
    dragButton?: React.ReactNode;
    onToggleCollapse?: (id: string) => void;
    className?: string;
}

/**
 * TreeItem is a memoized component that renders a tree item with depth indication and collapse functionality.
 */
export const TreeItem = memo(({ item, dragButton, className }: TreeItemProps) => {
    const { toggleExpandedId, expandedIds } = useSortableTree();

    const isExpanded = useMemo(() => {
        return expandedIds.has(item.id);
    }, [item.id, expandedIds]);

    const renderCollapseButton = useMemo(() => {
        return (
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'w-6 h-6 p-0 flex items-center justify-center',
                    !item.hasChildren && 'invisible'
                )}
                onClick={() => toggleExpandedId(item.id)}
                disabled={!item.hasChildren}
            >
                {item.hasChildren &&
                    (!isExpanded ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    ))}
            </Button>
        );
    }, [item.hasChildren, isExpanded, toggleExpandedId]);

    return (
        <div
            className={cn(
                'border w-full p-3 rounded-md flex gap-2 items-center bg-white hover:bg-gray-50 transition-colors',
                className
            )}
        >
            {/* Collapse/Expand button */}
            {renderCollapseButton}

            {/* Drag handle */}
            {dragButton}

            {/* Item content */}
            <div className="flex-1 flex items-center gap-2">
                <span className="font-medium">{item.id}</span>
                {item.hasChildren && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.childrenCount} items
                    </span>
                )}
            </div>
        </div>
    );
});

TreeItem.displayName = 'TreeItem';
