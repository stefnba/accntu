import { parseAsStringLiteral, useQueryState } from 'nuqs';

const createSteps = ['bank-selection', 'account-selection'] as const;

export const useCreateBankAccountModal = () => {
    const [update, setUpdate] = useQueryState(
        'create',
        parseAsStringLiteral(createSteps)
    );
    const [bankId, setBankId] = useQueryState('bankId');

    return {
        isOpen: !!update,
        type: update,
        handleOpen: (type: (typeof createSteps)[number]) => setUpdate(type),
        handleClose: () => {
            setUpdate(null);
            setBankId(null);
        },
        bankId,
        setBankId: (bankId: string | null) => setBankId(bankId)
    };
};
