'use client';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useTransactionEndpoints } from '../api';
import {
    PeekHeader,
    PeekInfoCards,
    PeekActions,
    PeekLoading,
    PeekError,
} from './transaction-peek';

interface TransactionPeekSheetProps {
    transactionId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TransactionPeekSheet = ({
    transactionId,
    isOpen,
    onClose,
}: TransactionPeekSheetProps) => {
    const { data: transaction, isLoading, error } = useTransactionEndpoints.getById({
        param: { id: transactionId || '' },
        options: {
            enabled: !!transactionId && isOpen,
        },
    });

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[400px] sm:w-[500px]">
                <SheetHeader>
                    <SheetTitle>Transaction Details</SheetTitle>
                    <SheetDescription>
                        Quick preview of transaction information
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {isLoading && <PeekLoading />}
                    {error && <PeekError error={error} />}
                    {transaction && (
                        <>
                            <PeekHeader transaction={transaction} />
                            <PeekInfoCards transaction={transaction} />
                            <PeekActions 
                                transactionId={transaction.id} 
                                onClose={onClose} 
                            />
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};