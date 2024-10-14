import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { storeUpdateConnectedBankSheet } from '@/features/connectedBank/store/update-bank-sheet';
import { countries } from '@/lib/constants';
import type { ConnectedAccountType } from '@db/types';

import { AccountTypeIcon } from './account-card';

type TBank = {
    id: string;
    logo: string | null;
    color: string | null;
    name: string;
    country?: string;
    accounts?: {
        id: string;
        name: string;
        type: ConnectedAccountType;
    }[];
};

interface Props {
    record: TBank;
}

/**
 * bank card component used in list of bank accounts.
 */
export const BankCard: React.FC<Props> = ({ record }) => {
    const { handleOpen } = storeUpdateConnectedBankSheet();

    const { id, name, logo, color, accounts, country } = record;

    return (
        <Card
            className="hover:shadow-md cursor-pointer hover:scale-[1.01] h-full"
            onClick={() => handleOpen(id)}
        >
            <CardHeader className="">
                <div className="flex mb-2">
                    <Avatar className="size-12">
                        {logo && <AvatarImage src={logo} />}
                        <AvatarFallback>{Array.from(name)[0]}</AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle className="text-xl">{name}</CardTitle>
                {country && (
                    <CardDescription className="mt[20px]">
                        {countries[country] || country}
                    </CardDescription>
                )}
            </CardHeader>

            {accounts && (
                <CardContent className="mt-0">
                    <div className="text-sm text-muted-foreground grid-1 space-y-2">
                        {accounts.map((a) => {
                            return (
                                <div
                                    key={a.id}
                                    className="flex h-4 items-center"
                                >
                                    <div className="mr-1">
                                        <AccountTypeIcon
                                            type={a.type}
                                            color={color || undefined}
                                        />
                                    </div>
                                    {a.name}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
