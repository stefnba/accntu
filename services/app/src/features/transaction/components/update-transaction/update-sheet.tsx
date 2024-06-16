import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { storeBulkUpdateTransactionSheet } from '@/features/transaction/store/bulk-update-transaction-sheet';

import { TransactionUpdateForm } from './update-form';

interface Props {}

export const TransactionUpdateSheet: React.FC<Props> = () => {
    const { handleClose, isOpen } = storeBulkUpdateTransactionSheet();

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Update Transactions</SheetTitle>
                    <SheetDescription>
                        Make changes to your transactions here. Click save whend
                        done.
                    </SheetDescription>
                </SheetHeader>
                <TransactionUpdateForm />
            </SheetContent>
        </Sheet>
    );
};
