import { Badge } from '@/components/ui/badge';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { useTransactionPeek } from '@/features/transaction/hooks';
import { IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';
import React from 'react';
import {
    formatCurrency,
    getAmountWithSign,
    getTypeBadgeVariant,
    getTypeColor,
    getTypeIcon,
} from '../../utils';

export const PeekHeader = () => {
    const { peekTransactionId } = useTransactionPeek();

    const { data: transaction } = useTransactionEndpoints.getById(
        {
            param: { id: peekTransactionId! },
        },
        {
            enabled: !!peekTransactionId,
        }
    );

    if (!transaction) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg leading-none">{transaction.title}</h3>
                    {transaction.originalTitle &&
                        transaction.originalTitle !== transaction.title && (
                            <p className="text-sm text-muted-foreground">
                                Originally: {transaction.originalTitle}
                            </p>
                        )}
                </div>
                <Badge variant={getTypeBadgeVariant(transaction.type)} className="capitalize">
                    {React.createElement(getTypeIcon(transaction.type), {
                        className: 'w-3 h-3 mr-1',
                    })}
                    {transaction.type}
                </Badge>
            </div>

            <div className={`text-2xl font-bold ${getTypeColor(transaction.type)}`}>
                {formatCurrency(
                    getAmountWithSign(Number(transaction.spendingAmount), transaction.type),
                    transaction.spendingCurrency
                )}
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
                <IconCalendar className="w-4 h-4 mr-2" />
                {format(new Date(transaction.date), 'PPP')}
            </div>
        </div>
    );
};
