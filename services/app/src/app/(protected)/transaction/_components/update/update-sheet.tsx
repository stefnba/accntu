import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import { useState } from 'react';
import { RxPencil2 } from 'react-icons/rx';

import { TransactionUpdateForm } from './update-form';

interface Props {}

export const TransactionUpdateSheet: React.FC<Props> = () => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto hidden h-8 lg:flex"
                >
                    <RxPencil2 className="mr-2 h-4 w-4" />
                    Update
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Update Transactions</SheetTitle>
                    <SheetDescription>
                        Make changes to your transactions here. Click save whend
                        done.
                    </SheetDescription>
                </SheetHeader>
                <TransactionUpdateForm handleClose={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    );
};
