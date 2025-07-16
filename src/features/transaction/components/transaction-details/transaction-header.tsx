import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { formatCurrency, getAmountWithSign, getTypeColor } from '@/features/transaction/utils';
import { formatDate } from '@/lib/utils/date-formatter';
import { IconCalendar } from '@tabler/icons-react';

interface TransactionHeaderProps {
    transactionId: string;
}

export const TransactionHeader = ({ transactionId }: TransactionHeaderProps) => {
    const { data: transaction } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (!transaction) return null;
    return (
        <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <CardTitle size="xl">{transaction.title}</CardTitle>
                        {transaction.isNew && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                New
                            </Badge>
                        )}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                        <IconCalendar className="w-4 h-4" />
                        {formatDate(transaction.date).format('DEFAULT_DATE')}
                    </CardDescription>
                </div>
                <div
                    className={`text-3xl font-semibold ${getTypeColor(transaction.type)} flex-shrink-0`}
                >
                    {formatCurrency(
                        getAmountWithSign(transaction.spendingAmount, transaction.type),
                        transaction.spendingCurrency
                    )}
                </div>
            </CardHeader>
        </Card>
    );
};
