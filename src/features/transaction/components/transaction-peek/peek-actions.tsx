import { Button } from '@/components/ui/button';
import { useTransactionPeek } from '@/features/transaction/hooks';
import { IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';

export const PeekActions = () => {
    const { closePeek, peekTransactionId } = useTransactionPeek();
    return (
        <div className="flex gap-2 pt-4">
            <Button asChild className="flex-1">
                <Link href={`/transactions/${peekTransactionId}`}>
                    <IconExternalLink className="w-4 h-4 mr-2" />
                    View Details
                </Link>
            </Button>
            <Button variant="outline" onClick={() => closePeek()}>
                Close
            </Button>
        </div>
    );
};
