'use client';

import { CreateConnectedBankModal } from '@/features/connectedBank/components/create-account/modal';
import { CreateImportModal } from '@/features/import/components/create-import/modal';
import { useMountedState } from 'react-use';

export const ModalProvider = () => {
    const isMounted = useMountedState();

    if (!isMounted) return null;
    return (
        <>
            <CreateConnectedBankModal />
            <CreateImportModal />
        </>
    );
};
