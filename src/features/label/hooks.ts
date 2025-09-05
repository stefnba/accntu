import { useQueryStateModal } from '@/hooks';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
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

    // view: form, parent, icon
    const [view, setView] = useQueryState(
        'view',
        parseAsStringLiteral(['form', 'parent', 'icon']).withDefault('form')
    );

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
            setView('form');
            setLabelId(labelId || null);
            setParentId(parentId || null);
        },
        labelId: labelId || null,
        parentId: parentId || null,
        setLabelId,
        setParentId,
        // view: form, parent, icon
        view,
        setView,
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
