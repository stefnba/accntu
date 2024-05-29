import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { TConnectedBanksResponse } from '@/features/connectedBank/api/get-connected-banks';
import { storeUpdateConnectedBankSheet } from '@/features/connectedBank/store/update-bank-sheet';
import { Plus, PlusCircle } from 'lucide-react';

interface Props {
    onClick?: () => void;
    account: TConnectedBanksResponse[0];
}

/**
 * Connected bank card component used mainly in list.
 */
export const ConnectedBankCard: React.FC<Props> = ({ onClick, account }) => {
    const { handleOpen } = storeUpdateConnectedBankSheet();

    const { id, bank } = account;

    return (
        <Card
            className="hover:shadow-md cursor-pointer"
            onClick={() => handleOpen(id)}
        >
            <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <Avatar className="size-20">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle>{bank.name}</CardTitle>
                {/* <CardDescription>sad</CardDescription> */}
            </CardHeader>
        </Card>
    );
};
