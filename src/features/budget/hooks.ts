import { parseAsBoolean, parseAsString, useQueryState } from 'nuqs';

/**
 * Hook to manage budget calculation modal state
 */
export const useBudgetCalculationModal = () => {
    const [modalIsOpen, setModalOpen] = useQueryState('budget', parseAsBoolean.withDefault(false));
    const [transactionId, setTransactionId] = useQueryState(
        'transactionId',
        parseAsString.withDefault('')
    );

    const openModal = (txId?: string) => {
        if (txId) setTransactionId(txId);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setTransactionId('');
    };
    
    return {
        // Modal state
        modalIsOpen,
        setModal: (open: boolean) => {
            setModalOpen(open);
        },
        openModal,
        closeModal,

        // Transaction state
        transactionId,
        setTransactionId,
    };
};