import { CreditCard } from 'lucide-react';

interface AccountCountProps {
    count: number | null | undefined;
}

export const AccountCount = ({ count }: AccountCountProps) => {
    if (count === 0 || !count) {
        return (
            <span className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                No accounts
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            {count} account{count > 1 ? 's' : ''}
        </span>
    );
};
