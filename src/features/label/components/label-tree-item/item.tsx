'use client';

import { FlattenedItem } from '@/components/sortable-tree';
import { Button } from '@/components/ui/button';
import { useLabelEndpoints } from '@/features/label/api';
import {
    LabelTreeItemAction,
    LabelTreeItemActions,
} from '@/features/label/components/label-tree-item/actions';
import { LabelTreeItemIcon } from '@/features/label/components/label-tree-item/icon';
import { type LabelFlattenedItem } from '@/features/label/components/sortable-tree/types';
import { useLabelModal } from '@/features/label/hooks';
import { cn } from '@/lib/utils';
import { UniqueIdentifier } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Edit2, Eye, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LabelTreeItemProps {
    item: FlattenedItem<LabelFlattenedItem>;
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
    const { id, name, color, icon, hasChildren, countChildren } = item;

    const { openCreateModal, openEditModal } = useLabelModal();
    const router = useRouter();

    // ================================
    // Mutations
    // ================================
    const deleteMutation = useLabelEndpoints.delete();

    // ====================
    // Handlers
    // ====================

    const handleToggleExpanded = () => {
        onToggleExpanded(item.id);
    };

    const handleView = (labelId: string) => {
        router.push(`/labels/${labelId}`);
    };

    const handleEdit = (labelId: string) => {
        openEditModal(labelId);
    };

    const handleAddChild = (labelId: string) => {
        openCreateModal(labelId);
    };

    const handleDelete = async (labelId: string) => {
        if (confirm('Are you sure you want to delete this label?')) {
            await deleteMutation.mutateAsync({ param: { id: labelId } });
        }
    };

    // ====================
    // Rendering
    // ====================
    return (
        <div
            className={cn(
                'border w-full p-3 rounded-md flex gap-2 items-center bg-white hover:bg-gray-50 transition-colors group'
            )}
            style={
                {
                    '--label-color': color,
                } as React.CSSProperties
            }
            onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftWidth = '4px';
                e.currentTarget.style.borderLeftColor = color || '';
                e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, ${color} 5%, white), color-mix(in srgb, ${color} 10%, white))`;
                e.currentTarget.style.borderTopLeftRadius = '0';
                e.currentTarget.style.borderBottomLeftRadius = '0';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftWidth = '1px';
                e.currentTarget.style.borderLeftColor = '';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderTopLeftRadius = '';
                e.currentTarget.style.borderBottomLeftRadius = '';
            }}
        >
            {/* Collapse/Expand button */}
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'w-6 h-6 p-0 flex items-center justify-center',
                    !item.hasChildren && 'invisible'
                )}
                onClick={handleToggleExpanded}
                disabled={!item.hasChildren}
            >
                {item.hasChildren &&
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
                {/* Icon */}
                <LabelTreeItemIcon icon={icon} color={color} />

                {/* Label name */}
                <span className="font-medium ml-1">{item.name}</span>

                {/* Children count */}
                {item.hasChildren && !isExpanded && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.countChildren} items
                    </span>
                )}

                {/* Actions */}
                <LabelTreeItemActions>
                    <LabelTreeItemAction labelId={id} onClick={handleView} tooltip="View label">
                        <Eye className="w-3 h-3" />
                    </LabelTreeItemAction>
                    <LabelTreeItemAction
                        labelId={id}
                        onClick={handleAddChild}
                        tooltip="Add child label"
                    >
                        <Plus className="w-3 h-3" />
                    </LabelTreeItemAction>
                    <LabelTreeItemAction labelId={id} onClick={handleEdit} tooltip="Edit label">
                        <Edit2 className="w-3 h-3" />
                    </LabelTreeItemAction>
                    <LabelTreeItemAction
                        labelId={id}
                        onClick={handleDelete}
                        tooltip="Delete label"
                        className="w-8 h-8 p-2 bg-red-50 hover:bg-red-100 rounded-full transition-all border border-red-200 hover:border-red-300 hover:scale-105"
                    >
                        <Trash2 className="w-3 h-3 text-red-600" />
                    </LabelTreeItemAction>
                </LabelTreeItemActions>
            </div>
        </div>
    );
};
