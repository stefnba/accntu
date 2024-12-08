import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TBankResponse } from '@/features/bank/api/get-bank';
import { ConnectedAccountTypeSchema } from '@db/schema';
import { LuBanknote, LuCreditCard, LuPiggyBank } from 'react-icons/lu';
import { z } from 'zod';

interface Props {
    onClick?: () => void;
    bank: TBankResponse;
}

/**
 * Bank & account card component used in Modal.
 */
export const BankAccountCard: React.FC<Props> = ({ onClick, bank }) => {
    return (
        <div
            onClick={onClick}
            className="flex text-2xl rounded-md border align-middle items-center justify-center h-24 cursor-pointer hover:shadow-md transition hover:border-gray-300"
        >
            {bank.name}
        </div>
    );
};

export const AccountTypeIcon: React.FC<{
    type: z.infer<typeof ConnectedAccountTypeSchema>;
    color?: string;
}> = ({ type }) => {
    if (type === 'CREDIT_CARD') return <LuCreditCard className="size-6" />;
    if (type === 'CURRENT') return <LuPiggyBank className="size-6" />;
    return null;
};

export const ConnectedAccountCard: React.FC<{
    name: string;
    type: z.infer<typeof ConnectedAccountTypeSchema>;
    description?: string | null;
    action?: React.ReactElement;
    color?: string;
}> = ({ name, type, description, action, color }) => {
    return (
        <Card className="flex items-center rounded-md border py-2 px-3 transition p-2 min-h-14">
            <AccountIcon type={type} color={color} />

            <div>
                <CardHeader className="m-0 p-0">
                    <Label size="lg">{name}</Label>
                    {description && (
                        <CardDescription className="mt-[-6px] p-0">
                            {description}
                        </CardDescription>
                        // <div className="text-sm text-muted-foreground mt-[-4px]">
                        //     This is a test account
                        // </div>
                    )}
                </CardHeader>
            </div>
            {action && <div className="ml-auto">{action}</div>}
        </Card>
    );
};

export const AccountIcon: React.FC<{
    type: z.infer<typeof ConnectedAccountTypeSchema>;
    color?: string;
}> = ({ color, type }) => {
    return (
        <div
            style={{ backgroundColor: color }}
            className="mr-3 bg-slate-400 text-white p-2 rounded-md"
        >
            <AccountTypeIcon type={type} color={color} />
        </div>
    );
};
