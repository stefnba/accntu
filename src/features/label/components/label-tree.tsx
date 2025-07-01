'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLabelEndpoints } from '../api';
import type { TLabelQuery } from '../schemas';

interface LabelTreeProps {
    labels: TLabelQuery['select'][];
    onEdit?: (label: TLabelQuery['select']) => void;
    onAddChild?: (parentId: string) => void;
    className?: string;
}

interface LabelTreeItemProps {
    label: TLabelQuery['select'] & { children?: TLabelQuery['select'][] };
    level?: number;
    onEdit?: (label: TLabelQuery['select']) => void;
    onAddChild?: (parentId: string) => void;
}

const LabelTreeItem = ({ label, level = 0, onEdit, onAddChild }: LabelTreeItemProps) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = label.children && label.children.length > 0;
    const deleteMutation = useLabelEndpoints.delete();

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this label?')) {
            await deleteMutation.mutateAsync({ param: { id: label.id } });
        }
    };

    return (
        <div className="space-y-1">
            <div
                className={cn(
                    'flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group',
                    level > 0 && 'ml-6'
                )}
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
                >
                    {hasChildren ? (
                        isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                        ) : (
                            <ChevronRight className="w-3 h-3" />
                        )
                    ) : (
                        <div className="w-3 h-3" />
                    )}
                </button>

                <Badge
                    style={{ backgroundColor: label.color || undefined, color: 'white' }}
                    className="flex-shrink-0"
                >
                    {label.name}
                </Badge>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddChild?.(label.id)}
                        className="h-6 w-6 p-0"
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(label)}
                        className="h-6 w-6 p-0"
                    >
                        <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="space-y-1">
                    {label.children?.map((child) => (
                        <LabelTreeItem
                            key={child.id}
                            label={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const LabelTree = ({ labels, onEdit, onAddChild, className }: LabelTreeProps) => {
    if (!labels || labels.length === 0) {
        return (
            <Card className={cn('text-center py-8 text-gray-500', className)}>
                No labels found. Create your first label to get started.
            </Card>
        );
    }

    return (
        <div className={cn('space-y-1', className)}>
            {labels.map((label) => (
                <LabelTreeItem
                    key={label.id}
                    label={label}
                    onEdit={onEdit}
                    onAddChild={onAddChild}
                />
            ))}
        </div>
    );
};
