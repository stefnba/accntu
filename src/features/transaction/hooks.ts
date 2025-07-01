import { useQueryState, parseAsString } from 'nuqs';

export const useTransactionPeek = () => {
    const [peekId, setPeekId] = useQueryState('peek', parseAsString);

    const openPeek = (transactionId: string) => {
        setPeekId(transactionId);
    };

    const closePeek = () => {
        setPeekId(null);
    };

    return {
        isOpen: !!peekId,
        transactionId: peekId,
        openPeek,
        closePeek,
    };
};