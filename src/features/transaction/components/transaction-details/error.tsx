import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconFileText } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export const TransactionError = () => {
    const router = useRouter();

    return (
        <Card className="p-6">
            <div className="text-center">
                <IconFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction not found</h3>
                <p className="text-gray-500 mb-4">
                    The requested transaction could not be found or you don't have access to it.
                </p>
                <Button onClick={() => router.push('/transactions')}>Back to Transactions</Button>
            </div>
        </Card>
    );
};