import { useQueryStateModal } from '@/hooks';
import { parseAsString, useQueryState } from 'nuqs';
import { create } from 'zustand';

/**
 * Hook to manage the label modal state using URL query parameters
 * @returns The label modal state and actions
 */
export const useLabelUpsertModal = () => {
    const views = ['create', 'update'] as const;

    // labelId for update
    const [labelId, setLabelId] = useQueryState('labelId', parseAsString.withDefault(''));

    // parentId for child label
    const [parentId, setParentId] = useQueryState('parentId', parseAsString.withDefault(''));

    const modalActions = useQueryStateModal({
        views,
        onClose: () => {
            setLabelId(null);
            setParentId(null);
        },
    });

    return {
        ...modalActions,
        openModal: ({
            view,
            labelId,
        }: {
            view: (typeof views)[number];
            labelId?: string | null;
            parentId?: string | null;
        }) => {
            modalActions.openModal(view);
            setLabelId(labelId || null);
            setParentId(parentId || null);
        },
        labelId: labelId || null,
        parentId: parentId || null,
        setLabelId,
        setParentId,
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
    open: ({ transactionId, labelId }: { transactionId: string; labelId?: string }) => void;
    setParentId: (parentId: string | null) => void;
    close: () => void;
    setOpen: (isOpen: boolean) => void;
}>((set) => ({
    isOpen: false,
    labelId: null,
    transactionId: null,
    parentId: null,
    open: ({ transactionId, labelId }: { transactionId: string; labelId?: string }) =>
        set({
            isOpen: true,
            transactionId,
            labelId: labelId || null,
        }),
    close: () => set({ isOpen: false, labelId: null, transactionId: null, parentId: null }),
    setParentId: (parentId: string | null) => set({ parentId }),
    setOpen: (isOpen: boolean) => set({ isOpen }),
}));
