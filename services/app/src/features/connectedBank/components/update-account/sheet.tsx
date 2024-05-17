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
                    <SheetTitle>{bank.name}</SheetTitle>
                </SheetHeader>

                <div className="my-8">
                    {accounts.map((a) => (
                        <div key={a.id}>{a.name}</div>
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
