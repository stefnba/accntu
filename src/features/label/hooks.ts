import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

const LABEL_MODAL_TYPES = ['create', 'edit'] as const;
export type TLabelModalType = (typeof LABEL_MODAL_TYPES)[number];

/**
 * Hook to manage the label modal state using URL query parameters
 * @returns The label modal state and actions
 */
export const useLabelModal = () => {
    const [modalOpen, setModalOpen] = useQueryState(
        'labelModal',
        parseAsBoolean.withDefault(false)
    );

    const [modalType, setModalType] = useQueryState(
        'labelModalType',
        parseAsStringLiteral(LABEL_MODAL_TYPES).withDefault('create')
    );

    const [labelId, setLabelId] = useQueryState('labelId', parseAsString.withDefault(''));

    const [parentId, setParentId] = useQueryState('parentId', parseAsString.withDefault(''));

    const openCreateModal = (parentLabelId?: string) => {
        setModalType('create');
        setParentId(parentLabelId || '');
        setLabelId('');
        setModalOpen(true);
    };

    const openEditModal = (editLabelId: string) => {
        setModalType('edit');
        setLabelId(editLabelId);
        setParentId('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalType(null);
        setLabelId(null);
        setParentId(null);
    };

    return {
        // Modal state
        modalOpen,
        modalType,
        labelId: labelId || null,
        parentId: parentId || null,

        // Actions
        openCreateModal,
        openEditModal,
        closeModal,
        setModalOpen,
    };
};