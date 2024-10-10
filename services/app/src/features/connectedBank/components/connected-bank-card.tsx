import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TConnectedBanksResponse } from '@/features/connectedBank/api/get-connected-banks';
import { storeUpdateConnectedBankSheet } from '@/features/connectedBank/store/update-bank-sheet';
import { CircleIcon, Plus, PlusCircle, StarIcon } from 'lucide-react';

import { AccountTypeIcon } from './account-card';

interface Props {
    onClick?: () => void;
    account: TConnectedBanksResponse[0];
}

/**
 * Connected bank card component used mainly in list.
 */
export const ConnectedBankCard: React.FC<Props> = ({ onClick, account }) => {
    const { handleOpen } = storeUpdateConnectedBankSheet();

    const { id, bank, accounts } = account;

    return (
        <Card
            className="hover:shadow-md cursor-pointer"
            onClick={() => handleOpen(id)}
            // style={{ borderColor: color || undefined }}
        >
            <CardHeader className="">
                <div className="flex mb-2">
                    <Avatar className="size-12">
                        {bank.logo && <AvatarImage src={bank.logo} />}
                        <AvatarFallback>
                            {Array.from(bank.name)[0]}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle className="text-xl">{bank.name}</CardTitle>
                <CardDescription>{bank.country}</CardDescription>
            </CardHeader>

            <CardContent className="mt-2">
                <div className="text-sm text-muted-foreground grid-1 space-y-2">
                    {accounts.map((a) => {
                        return (
                            <div
                                // style={{ color: bank.color || undefined }}
                                key={a.id}
                                className="flex h-4 items-center"
                            >
                                <div
                                    className="mr-1"
                                    // style={{ color: bank.color || undefined }}
                                >
                                    <AccountTypeIcon
                                        // className="h-3"
                                        type={a.type}
                                        color={bank.color || undefined}
                                    />
                                </div>
                                {/* <CircleIcon className="h-3 fill-sky-400 text-sky-400" /> */}
                                {a.name}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
