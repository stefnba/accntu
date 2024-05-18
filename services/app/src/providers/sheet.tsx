'use client';

import { UpdateConnectedBankSheet } from '@/features/connectedBank/components/update-account/sheet';
import { CreateLabelSheet } from '@/features/label/components/create-label/sheet';
import { ViewUpdateLabelSheet } from '@/features/label/components/update-label/sheet';
import { useMountedState } from 'react-use';

export const SheetProvider = () => {
    const isMounted = useMountedState();
    if (!isMounted) return null;

    return (
        <>
            <CreateLabelSheet />
            <ViewUpdateLabelSheet />
            <UpdateConnectedBankSheet />
        </>
    );
};
