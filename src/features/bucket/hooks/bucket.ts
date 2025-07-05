import { parseAsBoolean, parseAsString, useQueryState } from 'nuqs';

/**
 * Hook to manage the add/update bucket modal state
 *
 */
export const useCreateUpdateBucketModal = () => {
    const [modalIsOpen, setModalOpen] = useQueryState('m', parseAsBoolean.withDefault(false));
    const [bucketId, setBucketId] = useQueryState('bucketId', parseAsString.withDefault(''));

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };
    return {
        // Modal state
        modalIsOpen,
        setModal: (open: boolean) => {
            setModalOpen(open);
        },
        openModal,
        closeModal,

        // Bucket state
        bucketId,
        setBucketId,
    };
};
