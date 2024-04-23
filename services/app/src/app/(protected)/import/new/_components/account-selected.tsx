import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TransactionAccount } from '@/db/types';

export const ImportAccountSelected: React.FC<{
    account: TransactionAccount;
}> = ({ account }) => {
    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>{account.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="ghost" asChild className="m-4">
                    <Link href={{ pathname: 'new', search: '' }}>Change</Link>
                </Button>
            </CardContent>
        </Card>
    );
};
