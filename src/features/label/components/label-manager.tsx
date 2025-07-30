'use client';

import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Edit2, Eye, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLabelEndpoints } from '../api';
import { useLabelModal } from '../hooks';
import { LabelForm } from './label-form';
import {
    DragHandle,
    LabelTreeChildren,
    LabelTreeItem,
    LabelTreeItemAction,
    LabelTreeItemActions,
    LabelTreeItemButton,
    LabelTreeItemContent,
    LabelTreeItemHeader,
    LabelTreeItemIcon,
    LabelTreeItemTitle,
    LabelTreeSortable,
    useLabelTreeData,
} from './label-tree';

export const LabelManagerActionBar = () => {
    const { openCreateModal } = useLabelModal();
    return (
        <div className="flex items-center justify-end">
            <Button size="sm" onClick={() => openCreateModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Label
            </Button>
        </div>
    );
};

/*
 * Design 7A: Modern Enterprise - Color-Integrated Title
 */
const ModernEnterpriseVariantA = () => {
    // ================================
    // Hooks
    // ================================
    const { currentLabel } = useLabelTreeData();
    const { openCreateModal, openEditModal } = useLabelModal();
    const router = useRouter();

    // ================================
    // Mutations
    // ================================
    const deleteMutation = useLabelEndpoints.delete();

    // ================================
    // Handlers
    // ================================

    // Action handlers - labelId comes from context via LabelTreeItemAction
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

    if (!currentLabel) return null;

    const labelColor = currentLabel.color || '#6b7280';

    return (
        <LabelTreeItem>
            <LabelTreeItemButton />
            <LabelTreeItemContent>
                <div
                    className="flex items-center justify-between px-5 py-3 bg-white border border-gray-200 rounded-lg  w-full shadow-sm hover:shadow-md"
                    style={
                        {
                            '--label-color': labelColor,
                        } as React.CSSProperties
                    }
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderLeftWidth = '4px';
                        e.currentTarget.style.borderLeftColor = labelColor;
                        e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, ${labelColor} 5%, white), color-mix(in srgb, ${labelColor} 10%, white))`;
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
                    <div className="flex items-center space-x-2">
                        <DragHandle />
                        <LabelTreeItemHeader>
                            <LabelTreeItemIcon />
                            <LabelTreeItemTitle />
                        </LabelTreeItemHeader>
                    </div>
                    <LabelTreeItemActions>
                        <LabelTreeItemAction onClick={handleView} tooltip="View label">
                            <Eye className="w-3 h-3" />
                        </LabelTreeItemAction>
                        <LabelTreeItemAction onClick={handleAddChild} tooltip="Add child label">
                            <Plus className="w-3 h-3" />
                        </LabelTreeItemAction>
                        <LabelTreeItemAction onClick={handleEdit} tooltip="Edit label">
                            <Edit2 className="w-3 h-3" />
                        </LabelTreeItemAction>
                        <LabelTreeItemAction
                            onClick={handleDelete}
                            tooltip="Delete label"
                            className="w-8 h-8 p-2 bg-red-50 hover:bg-red-100 rounded-full transition-all border border-red-200 hover:border-red-300 hover:scale-105"
                        >
                            <Trash2 className="w-3 h-3 text-red-600" />
                        </LabelTreeItemAction>
                    </LabelTreeItemActions>
                </div>
            </LabelTreeItemContent>
            <LabelTreeChildren
                style={{ borderLeftColor: `color-mix(in srgb, ${labelColor} 40%, #e5e7eb)` }}
            >
                <ModernEnterpriseVariantA />
            </LabelTreeChildren>
        </LabelTreeItem>
    );
};

/*
 * Design 7A2: Modern Enterprise - Subtle Color Accent
 */
const ModernEnterpriseVariantA2 = () => {
    // ================================
    // Hooks
    // ================================
    const { openCreateModal, openEditModal } = useLabelModal();
    const router = useRouter();
    const { currentLabel } = useLabelTreeData();

    // ================================
    // Mutations
    // ================================
    const deleteMutation = useLabelEndpoints.delete();

    // ================================
    // Handlers
    // ================================

    // Action handlers - labelId comes from context via LabelTreeItemAction
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

    if (!currentLabel) return null;

    const labelColor = currentLabel.color || '#6b7280';

    return (
        <LabelTreeItem>
            <LabelTreeItemButton />
            <LabelTreeItemContent>
                <div className="flex items-center w-full group">
                    <div className="w-full">
                        <div
                            className="h-1.5 w-full"
                            style={{
                                backgroundColor: labelColor,
                            }}
                        />
                        <div
                            className="bg-white border-x border-b border-gray-200 rounded-b-md transition-all duration-300 ease-out w-full relative hover:shadow-lg"
                            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${labelColor} 4%, white)`;
                                e.currentTarget.style.borderColor = `color-mix(in srgb, ${labelColor} 30%, #d1d5db)`;
                                e.currentTarget.style.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px color-mix(in srgb, ${labelColor} 20%, transparent)`;
                            }}
                            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            <div className="flex items-center justify-between px-4 py-3">
                                <LabelTreeItemHeader>
                                    <LabelTreeItemIcon />
                                    <LabelTreeItemTitle />
                                </LabelTreeItemHeader>
                                <LabelTreeItemActions className="flex space-x-1 flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <LabelTreeItemAction onClick={handleView} tooltip="View label">
                                        <Eye className="w-3 h-3" />
                                    </LabelTreeItemAction>
                                    <LabelTreeItemAction
                                        onClick={handleAddChild}
                                        tooltip="Add child label"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </LabelTreeItemAction>
                                    <LabelTreeItemAction onClick={handleEdit} tooltip="Edit label">
                                        <Edit2 className="w-3 h-3" />
                                    </LabelTreeItemAction>
                                    <LabelTreeItemAction
                                        onClick={handleDelete}
                                        tooltip="Delete label"
                                        className="w-8 h-8 p-2 bg-red-50 hover:bg-red-100 rounded-full transition-all border border-red-200 hover:border-red-300 hover:scale-105"
                                    >
                                        <Trash2 className="w-3 h-3 text-red-600" />
                                    </LabelTreeItemAction>
                                </LabelTreeItemActions>
                            </div>
                        </div>
                    </div>
                </div>
            </LabelTreeItemContent>
            <LabelTreeChildren
                style={{ borderLeftColor: `color-mix(in srgb, ${labelColor} 30%, #d1d5db)` }}
            >
                <ModernEnterpriseVariantA2 />
            </LabelTreeChildren>
        </LabelTreeItem>
    );
};

export const LabelManager = () => {
    // ================================
    // Hooks
    // ================================
    const { modalOpen, modalType, labelId, parentId, closeModal } = useLabelModal();

    return (
        <div className="space-y-8">
            <LabelTreeSortable>
                <ModernEnterpriseVariantA />
            </LabelTreeSortable>

            {/* <OptimizedTreeExample /> */}

            {/* <LabelTree className="space-y-2 w-full">
                <ModernEnterpriseVariantA2 />
            </LabelTree> */}

            {/* <div>
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                Design 7A: Modern Enterprise - Color-Integrated Title
            </div>
            <div>
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                <h4 className="text-base font-semibold text-gray-800">
                    Variation 2: Gradient Background with Left Border
                </h4>
            </div> */}

            <ResponsiveModal open={modalOpen} onOpenChange={closeModal}>
                <DialogHeader>
                    <DialogTitle>
                        {modalType === 'create' ? 'Create New Label' : 'Edit Label'}
                    </DialogTitle>
                </DialogHeader>
                <LabelForm
                    labelId={modalType === 'edit' ? labelId : null}
                    parentId={parentId}
                    onSuccess={closeModal}
                />
            </ResponsiveModal>
        </div>
    );
};
