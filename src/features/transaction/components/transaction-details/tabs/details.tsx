import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { formatDate } from '@/lib/utils/date-formatter';

export const DetailsTab = ({ transactionId }: { transactionId: string }) => {
    const { data: transaction } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (!transaction) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {transaction.description && (
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">
                            Description
                        </label>
                        <p className="mt-1">{transaction.description}</p>
                    </div>
                )}
                {transaction.note && (
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Note</label>
                        <p className="mt-1">{transaction.note}</p>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="text-sm">
                            {formatDate(transaction.date).format('SHORT_MONTH_DAY_YEAR')}
                        </p>
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="mt-1 capitalize">{transaction.type}</p>
                </div>
                {transaction.status && (
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <p className="mt-1 capitalize">{transaction.status}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
