import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { useDeleteConnectedBank } from '@/features/connectedBank/api/delete-connected-bank';
import { useGetConnectedBank } from '@/features/connectedBank/api/get-connected-bank';
import { storeUpdateConnectedBankSheet } from '@/features/connectedBank/store/update-bank-sheet';
import { LuFileEdit, LuTrash } from 'react-icons/lu';

import { ConnectedAccountCard } from '../account-card';

export const UpdateConnectedBankSheet = () => {
    const { isOpen, handleClose, id } = storeUpdateConnectedBankSheet();

    const { data: connectedBank, isLoading } = useGetConnectedBank({ id });
    const { mutate: deleteConnectedBank } = useDeleteConnectedBank();

    if (!connectedBank) return null;

    const { bank, accounts } = connectedBank;

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent size="md">
                <SheetHeader>
                    <SheetTitle className="text-2xl">{bank.name}</SheetTitle>
                </SheetHeader>

                <div className="my-8 space-y-2">
                    {accounts.map((a) => (
                        <ConnectedAccountCard
                            name={a.name}
                            type={a.type}
                            key={a.id}
                            description={a.description}
                        />
                    ))}
                </div>

                {/* <Button size="sm" variant="outline" className="w-full">
                    <LuFileEdit className="size-4 mr-2" />
                    Edit
                </Button> */}
                <Button
                    size="sm"
                    variant="destructive"
                    className="w-full mt-2"
                    onClick={() => deleteConnectedBank({ id })}
                >
                    <LuTrash className="size-4 mr-2" />
                    Delete
                </Button>
            </SheetContent>
        </Sheet>
    );
};
