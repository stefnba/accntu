'use client';

import { CreateConnectedBankModal } from '@/features/connectedBank/components/create-account/modal';
import { UpdateUserImageModal } from '@/features/user/components/update-profile/update-image-modal';
import { useMountedState } from 'react-use';

export const ModalProvider = () => {
    const isMounted = useMountedState();

    if (!isMounted) return null;
    return (
        <>
            <CreateConnectedBankModal />
            <UpdateUserImageModal />
        </>
    );
};
