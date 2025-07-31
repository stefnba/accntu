'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UniqueIdentifier } from '@dnd-kit/core';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TLabelTreeItem } from './types';

interface LabelTreeItemProps {
    item: TLabelTreeItem;
    dragButton: React.ReactNode;
    isExpanded: boolean;
    onToggleExpanded: (id: UniqueIdentifier) => void;
}

/**
 * Individual label tree item renderer with expand/collapse functionality
 */
export const LabelTreeItem = ({
    item,
    dragButton,
    isExpanded,
    onToggleExpanded,
}: LabelTreeItemProps) => {
    const toggleExpanded = () => {
        onToggleExpanded(item.id);
    };

    return (
        <div
            className={cn(
                'border w-full p-3 rounded-md flex gap-2 items-center bg-white hover:bg-gray-50 transition-colors'
            )}
        >
            {/* Collapse/Expand button */}
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'w-6 h-6 p-0 flex items-center justify-center',
                    !item.children?.length && 'invisible'
                )}
                onClick={toggleExpanded}
                disabled={!item.children?.length}
            >
                {item.children?.length &&
                    (isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    ))}
            </Button>

            {/* Drag handle */}
            {dragButton}

            {/* Label content */}
            <div className="flex-1 flex items-center gap-2">
                {/* Color indicator */}
                {item.color && (
                    <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: item.color }}
                    />
                )}

                {/* Label name */}
                <span className="font-medium">{item.name}</span>

                {/* Children count */}
                {item.children?.length && !isExpanded && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.children.length} items
                    </span>
                )}
            </div>
        </div>
    );
};
