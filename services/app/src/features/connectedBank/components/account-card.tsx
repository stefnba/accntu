import { ConnectedAccountTypeSchema } from '@db/schema';
import { LuBanknote, LuCreditCard, LuPiggyBank } from 'react-icons/lu';
import { z } from 'zod';

interface Props {
    onClick?: () => void;
    label: string;
}

/**
 * Bank & account card component used in Modal.
 */
export const BankAccountCard: React.FC<Props> = ({ onClick, label }) => {
    return (
        <div
            onClick={onClick}
            className="flex text-2xl rounded-md border align-middle items-center justify-center h-24 cursor-pointer hover:shadow-md transition hover:border-gray-300"
        >
            {label}
        </div>
    );
};

const AccountTypeIcon: React.FC<{
    type: z.infer<typeof ConnectedAccountTypeSchema>;
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
}> = ({ name, type, description, action }) => {
    return (
        <div className="group flex items-center text-lg rounded-md border py-2 px-3 cursor-pointer transition">
            <div className="mr-3 bg-primary text-white p-2 rounded-md">
                <AccountTypeIcon type={type} />
            </div>

            <div>
                <div className="">{name}</div>
                {description && (
                    <div className="text-sm text-muted-foreground mt-[-4px]">
                        This is a test account
                    </div>
                )}
            </div>
            {action && <div className="ml-auto">{action}</div>}
        </div>
    );
};
