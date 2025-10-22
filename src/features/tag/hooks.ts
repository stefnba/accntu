'use client';

import { useResponsiveModal } from '@/components/responsive-modal';
import { parseAsString, useQueryState } from 'nuqs';
import { create } from 'zustand';

export const useTagSelectorModal = create<{
    isOpen: boolean;
    tagsIds: string[] | null;
    transactionId: string | null;
    open: ({ transactionId, tagsIds }: { transactionId: string; tagsIds?: string[] }) => void;
    close: () => void;
    setOpen: (isOpen: boolean) => void;
}>((set) => ({
    isOpen: false,
    tagsIds: null,
    transactionId: null,
    open: ({ transactionId, tagsIds }: { transactionId: string; tagsIds?: string[] }) =>
        set({
            isOpen: true,
            transactionId,
            tagsIds: tagsIds || null,
        }),
    close: () => set({ isOpen: false, tagsIds: null, transactionId: null }),
    setOpen: (isOpen: boolean) => set({ isOpen }),
}));

/**
 * A hook to manage the tag upsert modal.
 */
export const useTagUpsertModal = () => {
    const [tagId, setTagId] = useQueryState('tagId', parseAsString);

    const modal = useResponsiveModal({
        key: 'tag',
        views: ['create', 'update'],
        onClose: () => {
            setTagId(null);
        },
    });

    return {
        modal,
        tagId,
        setTagId,
    };
};
