import { Button } from '@/components/ui/button';
import { IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';

interface PeekActionsProps {
    transactionId: string;
    onClose: () => void;
}

export const PeekActions = ({ transactionId, onClose }: PeekActionsProps) => {
    return (
        <div className="flex gap-2 pt-4">
            <Button asChild className="flex-1">
                <Link href={`/transactions/${transactionId}`}>
                    <IconExternalLink className="w-4 h-4 mr-2" />
                    View Details
                </Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
                Close
            </Button>
        </div>
    );
};