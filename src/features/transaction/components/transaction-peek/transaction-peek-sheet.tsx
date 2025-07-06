'use client';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { PeekActions } from '@/features/transaction/components/transaction-peek/peek-actions';
import { PeekError } from '@/features/transaction/components/transaction-peek/peek-error';
import { PeekHeader } from '@/features/transaction/components/transaction-peek/peek-header';
import { PeekInfoCards } from '@/features/transaction/components/transaction-peek/peek-info-cards';
import { PeekLoading } from '@/features/transaction/components/transaction-peek/peek-loading';
import { useTransactionPeek } from '@/features/transaction/hooks';

interface TransactionPeekSheetProps {
    className?: string;
}

export const TransactionPeekSheet: React.FC<TransactionPeekSheetProps> = () => {
    const { isOpen, transactionId, closePeek } = useTransactionPeek();
    const {
        data: transaction,
        isLoading,
        error,
    } = useTransactionEndpoints.getById(
        {
            param: { id: transactionId || '' },
        },
        {
            enabled: !!transactionId && isOpen,
        }
    );

    return (
        <Sheet open={isOpen} onOpenChange={closePeek}>
            <SheetContent side="right" className="w-[400px] sm:w-[500px]">
                <SheetHeader>
                    <SheetTitle>Transaction Details</SheetTitle>
                    <SheetDescription>Quick preview of transaction information</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {isLoading && <PeekLoading />}
                    {error && <PeekError error={error} />}
                    {transaction && (
                        <>
                            <PeekHeader />
                            <PeekInfoCards />
                            <PeekActions />
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
