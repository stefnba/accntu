'use client';

import { Button } from '@/components/ui/button';

import type { TLabelService } from '@/features/label/schemas';
import { cn } from '@/lib/utils';
import { renderLabelIcon } from '@/lib/utils/icon-renderer';
import { ChevronRightIcon } from 'lucide-react';

interface LabelItemProps {
    label: TLabelService['selectFlattened'];
    selectedLabelId?: string | null;
    onSelect: (labelId: string) => void;
    onExpand?: (parentId: string) => void;
}

export const LabelListItem = ({ label, selectedLabelId, onSelect, onExpand }: LabelItemProps) => {
    const isSelected = selectedLabelId === label.id;

    const handleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        onExpand?.(label.id);
    };

    return (
        <Button
            asChild
            onClick={() => onSelect(label.id)}
            style={{ backgroundColor: label.color || '#6B7280', color: 'white' }}
            className={cn(
                'rounded-sm w-full justify-start px-3 py-6 text-sm font-medium hover:bg-transparent'
            )}
        >
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    {renderLabelIcon(label.icon, 'w-4 h-4')}
                    {label.name}
                </div>
                {onExpand && label.hasChildren && (
                    <Button variant="ghost" size="icon" className="ml-auto" onClick={handleExpand}>
                        <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </Button>
    );
};
