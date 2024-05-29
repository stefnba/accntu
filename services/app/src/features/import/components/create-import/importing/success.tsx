import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface Props {
    countTransactions: number;
}

export const ImportSuccess = ({ countTransactions }: Props) => {
    return (
        <div className="text-center">
            <h1>Import Success</h1>
            <p className="mt-8">
                {countTransactions} transactions have been imported
            </p>

            <Button asChild>
                <Link href="/transaction">View Transactions</Link>
            </Button>
        </div>
    );
};
