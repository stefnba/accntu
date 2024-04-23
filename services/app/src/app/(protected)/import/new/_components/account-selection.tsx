import Link from 'next/link';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import type { TransactionAccount } from '@/db/types';

interface Props {
    accounts: TransactionAccount[];
}

const AccountCard: React.FC<{ account: TransactionAccount }> = ({
    account
}) => {
    return (
        <Link
            href={{
                pathname: 'new',
                query: { accountId: account.id }
            }}
        >
            <Card className="hover:shadow-md">
                <CardHeader>
                    <CardTitle>{account.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>{account.description}</CardDescription>
                </CardContent>
                <CardFooter>{account.description}</CardFooter>
            </Card>
        </Link>
    );
};

export const AccountSelection: React.FC<Props> = ({ accounts }) => {
    return (
        <div className="grid grid-cols-4 gap-4">
            {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
            ))}
        </div>
    );
};
