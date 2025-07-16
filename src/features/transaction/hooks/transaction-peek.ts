import { parseAsString, useQueryState } from 'nuqs';

/**
 * Hook for managing the transaction peek state
 */
export const useTransactionPeek = () => {
    const [peekTransactionId, setPeekTransactionId] = useQueryState('p', parseAsString);

    const openPeek = (transactionId: string) => {
        setPeekTransactionId(transactionId);
    };

    const closePeek = () => {
        setPeekTransactionId(null);
    };

    return {
        isOpen: !!peekTransactionId,
        transactionId: peekTransactionId,
        openPeek,
        closePeek,
        peekTransactionId,
    };
};
