import React from 'react';
import { Badge } from '@/components/ui/badge';
import { IconCalendar } from '@tabler/icons-react';
import { format } from 'date-fns';
import { TransactionWithRelations } from '../transaction-columns';
import { formatCurrency, getTypeIcon, getTypeColor, getAmountWithSign, getTypeBadgeVariant } from '../../utils';

interface PeekHeaderProps {
    transaction: TransactionWithRelations;
}

export const PeekHeader = ({ transaction }: PeekHeaderProps) => {
    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg leading-none">
                        {transaction.title}
                    </h3>
                    {transaction.originalTitle && 
                     transaction.originalTitle !== transaction.title && (
                        <p className="text-sm text-muted-foreground">
                            Originally: {transaction.originalTitle}
                        </p>
                    )}
                </div>
                <Badge
                    variant={getTypeBadgeVariant(transaction.type)}
                    className="capitalize"
                >
                    {React.createElement(getTypeIcon(transaction.type), {
                        className: 'w-3 h-3 mr-1',
                    })}
                    {transaction.type}
                </Badge>
            </div>

            <div className={`text-2xl font-bold ${getTypeColor(transaction.type)}`}>
                {formatCurrency(
                    getAmountWithSign(
                        parseFloat(transaction.spendingAmount),
                        transaction.type
                    ),
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