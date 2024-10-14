import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { useDeleteConnectedBank } from '@/features/connectedBank/api/delete-connected-bank';
import { useGetConnectedBank } from '@/features/connectedBank/api/get-connected-bank';
import { storeUpdateConnectedBankSheet } from '@/features/connectedBank/store/update-bank-sheet';
import { countries } from '@/lib/constants';
import { LuTrash } from 'react-icons/lu';

import { ConnectedAccountCard } from '../account-card';

export const UpdateConnectedBankSheet = () => {
    const { isOpen, handleClose, id } = storeUpdateConnectedBankSheet();

    const { data: connectedBank, isLoading } = useGetConnectedBank({ id });
    const { mutate: deleteConnectedBank } = useDeleteConnectedBank();

    if (!connectedBank) return null;

    const { bank, accounts } = connectedBank;

    if (!id) return <div>Bank not found</div>;

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent size="md">
                <SheetHeader>
                    <SheetTitle className="flex items-center">
                        <Avatar className="size-10 mr-2">
                            {bank.logo && <AvatarImage src={bank.logo} />}
                            <AvatarFallback>
                                {Array.from(bank.name)[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-2xl">{bank.name}</div>
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6 text-sm">
                    {/* Details */}
                    <div className="grid gap-3">
                        <div className="font-semibold">Details</div>
                        <ul className="grid gap-3">
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Type
                                </span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Country
                                </span>
                                {countries[bank.country] || bank.country}
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    BIC
                                </span>
                                {bank.bic}
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    # Transactions
                                </span>
                                {bank.bic}
                            </li>
                        </ul>
                    </div>
                    <Separator className="my-4" />
                    {/* Accounts */}
                    <div className="font-semibold">Accounts</div>
                    <div className="my-4 space-y-2">
                        {accounts.map((a) => (
                            <ConnectedAccountCard
                                name={a.name}
                                type={a.type}
                                key={a.id}
                                description={a.description}
                                color={bank.color || undefined}
                            />
                        ))}
                    </div>
                    <Separator className="my-4" />
                    {/* Accounts */}
                    <div className="font-semibold">Recent Transactions</div>
                    To come ...
                </div>

                {/* <Button size="sm" variant="outline" className="w-full">
                    <LuFileEdit className="size-4 mr-2" />
                    Edit
                </Button> */}

                <div className="mt-10">
                    <Button
                        size="sm"
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={() => deleteConnectedBank({ id })}
                    >
                        <LuTrash className="size-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
