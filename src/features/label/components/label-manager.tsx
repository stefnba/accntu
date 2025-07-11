'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Edit2, Eye, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLabelEndpoints } from '../api';
import { useLabelModal } from '../hooks';
import { LabelForm } from './label-form';
import {
    LabelTree,
    LabelTreeChildren,
    LabelTreeItem,
    LabelTreeItemAction,
    LabelTreeItemActions,
    LabelTreeItemButton,
    LabelTreeItemContent,
    LabelTreeItemIcon,
    LabelTreeItemTitle,
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

export const LabelManager = () => {
    const { modalOpen, modalType, labelId, parentId, closeModal, openCreateModal, openEditModal } =
        useLabelModal();
    const router = useRouter();
    const deleteMutation = useLabelEndpoints.delete();

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

    /*
     * Design 7A: Modern Enterprise - Color-Integrated Title
     */
    const ModernEnterpriseVariantA = () => {
        const { currentLabel } = useLabelTreeData();

        if (!currentLabel) return null;

        const labelColor = currentLabel.color || 'gray';

        return (
            <LabelTreeItem>
                <LabelTreeItemContent>
                    <LabelTreeItemButton
                        className="flex-shrink-0 font-medium transition-colors"
                        style={{
                            color: `color-mix(in srgb, ${labelColor} 80%, black)`,
                        }}
                    />
                    <div
                        className="flex items-center justify-between px-6 py-2 bg-white border-l-6 border-t border-r border-b border-gray-200 rounded-lg transition-all duration-200 group w-full shadow-sm"
                        style={{
                            borderLeftColor: labelColor,
                            // background: `linear-gradient(to right, white, color-mix(in srgb, ${labelColor} 5%, transparent))`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, ${labelColor} 8%, white), color-mix(in srgb, ${labelColor} 15%, white))`;
                            e.currentTarget.style.borderColor = `color-mix(in srgb, ${labelColor} 70%, transparent)`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = `white`;
                            e.currentTarget.style.borderColor = '';
                        }}
                    >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <LabelTreeItemIcon />
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <LabelTreeItemTitle className="text-gray-900 font-semibold text-base group-hover:opacity-90 transition-all truncate" />
                                </div>
                            </div>
                        </div>
                        <LabelTreeItemActions className="flex space-x-1 flex-shrink-0 ml-4">
                            <LabelTreeItemAction
                                onClick={handleView}
                                tooltip="View label"
                                className="w-8 h-8 p-2 bg-white text hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
                                style={
                                    {
                                        borderColor: labelColor,
                                    } as React.CSSProperties
                                }
                            >
                                <Eye
                                    className="w-3 h-3"
                                    // style={{
                                    //     color: labelColor,
                                    // }}
                                />
                            </LabelTreeItemAction>
                            <LabelTreeItemAction
                                onClick={handleAddChild}
                                tooltip="Add child label"
                                className="w-8 h-8 p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors border border-green-200"
                            >
                                <Plus className="w-3 h-3 text-green-700" />
                            </LabelTreeItemAction>
                            <LabelTreeItemAction
                                onClick={handleEdit}
                                tooltip="Edit label"
                                className="w-8 h-8 p-2 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors border border-amber-200"
                            >
                                <Edit2 className="w-3 h-3 text-amber-700" />
                            </LabelTreeItemAction>
                            <LabelTreeItemAction
                                onClick={handleDelete}
                                tooltip="Delete label"
                                className="w-8 h-8 p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors border border-red-200"
                            >
                                <Trash2 className="w-3 h-3 text-red-700" />
                            </LabelTreeItemAction>
                        </LabelTreeItemActions>
                    </div>
                </LabelTreeItemContent>
                <LabelTreeChildren
                    className="ml-8 mt-2 pl-4 border-l-2"
                    style={{ borderLeftColor: `color-mix(in srgb, ${labelColor} 30%, gray)` }}
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
        const { currentLabel } = useLabelTreeData();

        if (!currentLabel) return null;

        const labelColor = currentLabel.color || 'gray';

        return (
            <LabelTreeItem>
                <LabelTreeItemContent>
                    <div
                        className="flex items-center justify-between p-3 bg-white border border-t-4 border-gray-200 rounded-sm transition-all duration-200 group w-full relative overflow-hidden"
                        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${labelColor} 5%, white)`;
                            e.currentTarget.style.borderColor = `color-mix(in srgb, ${labelColor} 40%, gray)`;
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            // e.currentTarget.style.borderColor = '';
                        }}
                        style={{
                            borderTopColor: labelColor,
                        }}
                    >
                        {/* <div
                            className="absolute top-0 left-0 w-full h-1"
                            style={{
                                background: labelColor,
                            }}
                        ></div> */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <LabelTreeItemButton
                                className="text-gray-600 flex-shrink-0 transition-colors"
                                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                                    e.currentTarget.style.color = `color-mix(in srgb, ${labelColor} 70%, black)`;
                                }}
                                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                                    e.currentTarget.style.color = '';
                                }}
                            />
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <LabelTreeItemIcon />
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <LabelTreeItemTitle
                                        className="text-gray-900 font-semibold text-base transition-colors truncate"
                                        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                                            e.currentTarget.style.color = `color-mix(in srgb, ${labelColor} 60%, black)`;
                                        }}
                                        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                                            e.currentTarget.style.color = '';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <LabelTreeItemActions className="flex space-x-1 flex-shrink-0 ml-4">
                            <LabelTreeItemAction
                                onClick={handleView}
                                tooltip="View label"
                                className="w-8 h-8 p-2 rounded-full transition-colors border"
                                style={{
                                    backgroundColor:
                                        'color-mix(in srgb, var(--label-color) 8%, white)',
                                    borderColor: 'color-mix(in srgb, var(--label-color) 20%, gray)',
                                }}
                            >
                                <Eye
                                    className="w-3 h-3"
                                    style={{
                                        color: 'color-mix(in srgb, var(--label-color) 70%, black)',
                                    }}
                                />
                            </LabelTreeItemAction>
                            <LabelTreeItemAction
                                onClick={handleAddChild}
                                tooltip="Add child label"
                                className="w-8 h-8 p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors border border-green-200"
                            >
                                <Plus className="w-3 h-3 text-green-700" />
                            </LabelTreeItemAction>
                            <LabelTreeItemAction
                                onClick={handleEdit}
                                tooltip="Edit label"
                                className="w-8 h-8 p-2 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors border border-amber-200"
                            >
                                <Edit2 className="w-3 h-3 text-amber-700" />
                            </LabelTreeItemAction>
                            <LabelTreeItemAction
                                onClick={handleDelete}
                                tooltip="Delete label"
                                className="w-8 h-8 p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors border border-red-200"
                            >
                                <Trash2 className="w-3 h-3 text-red-700" />
                            </LabelTreeItemAction>
                        </LabelTreeItemActions>
                    </div>
                </LabelTreeItemContent>
                <LabelTreeChildren
                    className="ml-8 mt-2 pl-4 border-l-2"
                    style={{ borderLeftColor: 'color-mix(in srgb, var(--label-color) 30%, gray)' }}
                >
                    <ModernEnterpriseVariantA2 />
                </LabelTreeChildren>
            </LabelTreeItem>
        );
    };

    return (
        <div className="space-y-8">
            {/* Design 7A: Modern Enterprise - Color-Integrated Title */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                        Design 7A: Modern Enterprise - Color-Integrated Title
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Dynamic label colors from data context integrated throughout: customized
                        borders, hover backgrounds, text colors, and accent elements that adapt to
                        each label's unique color
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Variation 1: Gradient Background with Left Border
                            </h4>
                            <LabelTree className="space-y-2 w-full">
                                <ModernEnterpriseVariantA />
                            </LabelTree>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Variation 2: Subtle Color Accent
                            </h4>
                            <LabelTree className="space-y-2 w-full">
                                <ModernEnterpriseVariantA2 />
                            </LabelTree>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
