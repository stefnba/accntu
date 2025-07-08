import { Badge } from '@/components/ui/badge';
import { IconArrowsUpDown, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { TTransaction } from './transaction-table/table-columns';

export type TTransactionType = TTransaction['type'];

export interface TransactionTypeBadgeProps {
    type: TTransactionType;
}

export const TRANSACTION_TYPE_OPTIONS: Array<{
    id: TTransactionType;
    name: string;
    color: string;
}> = [
    { id: 'credit', name: 'Credit', color: '#10b981' },
    { id: 'debit', name: 'Debit', color: '#ef4444' },
    { id: 'transfer', name: 'Transfer', color: '#3b82f6' },
] as const;

export const TransactionTypeBadge = ({ type }: TransactionTypeBadgeProps) => {
    const icon =
        type === 'credit' ? IconTrendingUp : type === 'debit' ? IconTrendingDown : IconArrowsUpDown;
    const Icon = icon;

    return (
        <Badge
            style={{
                backgroundColor: TRANSACTION_TYPE_OPTIONS.find((option) => option.id === type)
                    ?.color,
            }}
            className="capitalize"
        >
            <Icon className="w-3 h-3 mr-1" />
            {TRANSACTION_TYPE_OPTIONS.find((option) => option.id === type)?.name}
        </Badge>
    );
};
