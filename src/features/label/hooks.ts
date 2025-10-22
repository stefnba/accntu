'use client';

import { useResponsiveModal } from '@/components/responsive-modal';
import { parseAsString, useQueryState } from 'nuqs';
import { create } from 'zustand';

/**
 * Hook to manage the label modal state using URL query parameters
 * @returns The label modal state and actions
 */
export const useLabelUpsertModal = () => {
    // labelId for update
    const [labelId, setLabelId] = useQueryState('labelId', parseAsString.withDefault(''));

    // parentId for child label
    const [parentId, setParentId] = useQueryState('parentId', parseAsString.withDefault(''));

    // Main modal with create/update views
    const modal = useResponsiveModal({
        key: 'label',
        views: ['create', 'update'],
        onClose: () => {
            setLabelId(null);
            setParentId(null);
        },
    });

    // Sub-views within the modal: form, parent, icon
    const subViewModal = useResponsiveModal({
        key: 'view',
        views: ['form', 'parent', 'icon'],
        defaultView: 'form',
    });

    return {
        isModalOpen: modal.isOpen,
        closeModal: modal.close,
        modalView: modal.view,
        openModal: ({
            view,
            labelId,
            parentId,
        }: {
            view: 'create' | 'update';
            labelId?: string | null;
            parentId?: string | null;
        }) => {
            modal.open(view);
            subViewModal.open('form');
            setLabelId(labelId || null);
            setParentId(parentId || null);
        },
        labelId: labelId || null,
        parentId: parentId || null,
        setLabelId,
        setParentId,
        // Sub-views: form, parent, icon
        view: subViewModal.view,
        setView: subViewModal.open,
        // View component for sub-views
        View: subViewModal.View,
    };
};

/**
 * Hook with zustand to manage the label selector modal.
 * No usage of nuqs here.
 */
export const useLabelSelectorModal = create<{
    isOpen: boolean;
    labelId: string | null;
    transactionId: string | null;
    parentId: string | null;
    openModal: ({ transactionId, labelId }: { transactionId: string; labelId?: string }) => void;
    setParentId: (parentId: string | null) => void;
    closeModal: () => void;
    setOpen: (isOpen: boolean) => void;
}>((set) => ({
    isOpen: false,
    labelId: null,
    transactionId: null,
    parentId: null,
    openModal: ({ transactionId, labelId }: { transactionId: string; labelId?: string }) =>
        set({
            isOpen: true,
            transactionId,
            labelId: labelId || null,
        }),
    closeModal: () => set({ isOpen: false, labelId: null, transactionId: null, parentId: null }),
    setParentId: (parentId: string | null) => set({ parentId }),
    setOpen: (isOpen: boolean) => set({ isOpen }),
}));
