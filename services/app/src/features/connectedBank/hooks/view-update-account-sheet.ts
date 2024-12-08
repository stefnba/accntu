'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

export const useViewUpdateBankAccountSheet = () => {
    const [bankId, setBankId] = useQueryState('bankId');

    return {
        isOpen: !!bankId,
        // mode,
        handleOpen: (bankId: string) => setBankId(bankId),
        handleClose: () => {
            setBankId(null);
        },
        bankId
    };
};
