/**
 * Example implementation showing how to integrate the label tree with expand/collapse functionality
 *
 * **DRY Template Approach**:
 * - Create a reusable template component inside your function
 * - Template calls itself recursively inside `LabelTreeChildren`
 * - Eliminates code duplication and ensures consistent structure across all levels
 * - Single source of truth for layout and behavior
 *
 * Copy this pattern into your actual components
 */

'use client';

import { Edit2, Eye, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLabelEndpoints } from '../../api';
import { useLabelModal } from '../../hooks';
import {
    LabelTree,
    LabelTreeSortable,
    LabelTreeChildren,
    LabelTreeItem,
    LabelTreeItemAction,
    LabelTreeItemActions,
    LabelTreeItemBadge,
    LabelTreeItemButton,
    LabelTreeItemContent,
    DragHandle,
} from './index';

// Example 1: Complete tree with all functionality (DRY Template Approach)
export function CompleteLabelTreeExample() {
    const { openCreateModal, openEditModal } = useLabelModal();
    const router = useRouter();
    const deleteMutation = useLabelEndpoints.delete();

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
     * Reusable label item template - DRY principle
     * This template is used recursively for all levels of nesting
     */
    const LabelItemTemplate = () => (
        <LabelTreeItem>
            <LabelTreeItemContent>
                {/* Button to expand/collapse the label */}
                <LabelTreeItemButton />

                {/* Badge with name and icon */}
                <LabelTreeItemBadge />

                {/* Actions */}
                <LabelTreeItemActions>
                    {/* View label */}
                    <LabelTreeItemAction onClick={handleView} tooltip="View label">
                        <Eye className="w-3 h-3" />
                    </LabelTreeItemAction>

                    {/* Add child label */}
                    <LabelTreeItemAction onClick={handleAddChild} tooltip="Add child label">
                        <Plus className="w-3 h-3" />
                    </LabelTreeItemAction>

                    {/* Edit label */}
                    <LabelTreeItemAction onClick={handleEdit} tooltip="Edit label">
                        <Edit2 className="w-3 h-3" />
                    </LabelTreeItemAction>

                    {/* Delete label */}
                    <LabelTreeItemAction
                        onClick={handleDelete}
                        tooltip="Delete label"
                        className="text-red-600"
                    >
                        <Trash2 className="w-3 h-3" />
                    </LabelTreeItemAction>
                </LabelTreeItemActions>
            </LabelTreeItemContent>

            {/*
             * Recursive rendering: LabelTreeChildren will map over children
             * and render this template for each child level
             */}
            <LabelTreeChildren>
                <LabelItemTemplate />
            </LabelTreeChildren>
        </LabelTreeItem>
    );

    return (
        <LabelTree className="border rounded-lg p-4">
            <LabelItemTemplate />
        </LabelTree>
    );
}

// Example 2: Minimal tree (just expand/collapse and labels) - DRY Template Approach
export function MinimalLabelTreeExample() {
    /*
     * Minimal template with only essential components
     */
    const MinimalTemplate = () => (
        <LabelTreeItem>
            <LabelTreeItemContent>
                {/* Expand/collapse button */}
                <LabelTreeItemButton />

                {/* Label display */}
                <LabelTreeItemBadge />
            </LabelTreeItemContent>

            {/* Recursive children rendering */}
            <LabelTreeChildren>
                <MinimalTemplate />
            </LabelTreeChildren>
        </LabelTreeItem>
    );

    return (
        <LabelTree>
            <MinimalTemplate />
        </LabelTree>
    );
}

// Example 3: Tree with selection functionality - DRY Template Approach
export function SelectableLabelTreeExample() {
    const handleLabelSelect = (labelId: string) => {
        console.log('Selected label:', labelId);
        // Handle selection logic here
    };

    /*
     * Selectable template - badges become clickable when onSelect is provided
     */
    const SelectableTemplate = () => (
        <LabelTreeItem>
            <LabelTreeItemContent>
                <LabelTreeItemButton />

                {/* Will be clickable because onSelect is provided to LabelTree */}
                <LabelTreeItemBadge />
            </LabelTreeItemContent>

            {/* Recursive children rendering */}
            <LabelTreeChildren>
                <SelectableTemplate />
            </LabelTreeChildren>
        </LabelTreeItem>
    );

    return (
        <LabelTree onSelect={handleLabelSelect}>
            <SelectableTemplate />
        </LabelTree>
    );
}

// Example 4: Nested Drag and Drop Tree - Advanced Functionality
export function NestedDragDropLabelTreeExample() {
    const { openCreateModal, openEditModal } = useLabelModal();
    const deleteMutation = useLabelEndpoints.delete();

    const handleView = (labelId: string) => {
        console.log('View label:', labelId);
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
     * Sortable template with drag handle and full functionality
     * Supports nested drag and drop across different levels
     */
    const SortableLabelTemplate = () => (
        <LabelTreeItem>
            <LabelTreeItemContent>
                {/* Drag handle for reordering */}
                <DragHandle />

                {/* Button to expand/collapse the label */}
                <LabelTreeItemButton />

                {/* Badge with name and icon */}
                <LabelTreeItemBadge />

                {/* Actions */}
                <LabelTreeItemActions>
                    {/* View label */}
                    <LabelTreeItemAction onClick={handleView} tooltip="View label">
                        <Eye className="w-3 h-3" />
                    </LabelTreeItemAction>

                    {/* Add child label */}
                    <LabelTreeItemAction onClick={handleAddChild} tooltip="Add child label">
                        <Plus className="w-3 h-3" />
                    </LabelTreeItemAction>

                    {/* Edit label */}
                    <LabelTreeItemAction onClick={handleEdit} tooltip="Edit label">
                        <Edit2 className="w-3 h-3" />
                    </LabelTreeItemAction>

                    {/* Delete label */}
                    <LabelTreeItemAction
                        onClick={handleDelete}
                        tooltip="Delete label"
                        className="text-red-600"
                    >
                        <Trash2 className="w-3 h-3" />
                    </LabelTreeItemAction>
                </LabelTreeItemActions>
            </LabelTreeItemContent>

            {/*
             * NOTE: Children are now handled automatically by the flattened tree structure
             * No need for recursive LabelTreeChildren in sortable mode
             */}
        </LabelTreeItem>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Nested Drag & Drop Labels</h3>
                <p className="text-sm text-muted-foreground">
                    Drag horizontally to change nesting level
                </p>
            </div>
            
            <LabelTreeSortable className="border rounded-lg p-4">
                <SortableLabelTemplate />
            </LabelTreeSortable>
        </div>
    );
}

// Example 5: Custom layout - DRY Template Approach  
export function CustomLayoutLabelTreeExample() {
    const handleEdit = (labelId: string) => {
        console.log('Edit label:', labelId);
    };

    /*
     * Custom layout template - different component order
     */
    const CustomLayoutTemplate = () => (
        <LabelTreeItem>
            <LabelTreeItemContent>
                {/* Label first */}
                <LabelTreeItemBadge />

                {/* Button second */}
                <LabelTreeItemButton />

                {/* Actions on the right */}
                <div className="ml-auto">
                    <LabelTreeItemActions>
                        <LabelTreeItemAction onClick={handleEdit} tooltip="Edit">
                            <Edit2 className="w-3 h-3" />
                        </LabelTreeItemAction>
                    </LabelTreeItemActions>
                </div>
            </LabelTreeItemContent>

            {/* Recursive children rendering */}
            <LabelTreeChildren>
                <CustomLayoutTemplate />
            </LabelTreeChildren>
        </LabelTreeItem>
    );

    return (
        <LabelTree>
            <CustomLayoutTemplate />
        </LabelTree>
    );
}
