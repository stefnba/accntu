'use client';

import { ViewImportSheet } from '@/features/import/components/view-import/sheet';
import { CreateLabelSheet } from '@/features/label/components/create-label/sheet';
import { ViewUpdateLabelSheet } from '@/features/label/components/update-label/sheet';
import { TagCrudSheet } from '@/features/tag/components/crud/sheet';
import { TransactionUpdateSheet } from '@/features/transaction/components/update-transaction/update-sheet';
import { ViewTransactionSheet } from '@/features/transaction/components/view-transaction/view-transaction-sheet';
import { useMountedState } from 'react-use';

export const SheetProvider = () => {
    const isMounted = useMountedState();
    if (!isMounted) return null;

    return (
        <>
            <ViewTransactionSheet />
            <CreateLabelSheet />
            <ViewImportSheet />
            <TagCrudSheet />
            <TransactionUpdateSheet />
            <ViewUpdateLabelSheet />
        </>
    );
};
