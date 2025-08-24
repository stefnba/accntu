import { cn } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

interface AccountCountProps {
    count: number | null | undefined;
    className?: string;
}

export const AccountCount = ({ count, className }: AccountCountProps) => {
    const renderText = () => {
        if (count === 0 || !count) {
            return 'No accounts';
        }
        if (count === 1) {
            return '1 account';
        }
        return `${count} accounts`;
    };

    return (
        <span className={cn('flex items-center gap-1.5 text-muted-foreground', className)}>
            <CreditCard className="h-4 w-4" />
            <span className="text-sm">{renderText()}</span>
        </span>
    );
};
