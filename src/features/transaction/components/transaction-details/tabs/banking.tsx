import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionEndpoints } from '@/features/transaction/api';

export const BankingTab = ({ transactionId }: { transactionId: string }) => {
    const { data: transaction } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (!transaction) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Banking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transaction.counterparty && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Counterparty
                            </label>
                            <p className="mt-1">{transaction.counterparty}</p>
                        </div>
                    )}
                    {transaction.reference && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Reference
                            </label>
                            <p className="mt-1 font-mono text-sm">{transaction.reference}</p>
                        </div>
                    )}
                    {transaction.iban && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                IBAN
                            </label>
                            <p className="mt-1 font-mono text-sm">{transaction.iban}</p>
                        </div>
                    )}
                    {transaction.bic && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">BIC</label>
                            <p className="mt-1 font-mono text-sm">{transaction.bic}</p>
                        </div>
                    )}
                    {transaction.providerTransactionId && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Provider Transaction ID
                            </label>
                            <p className="mt-1 font-mono text-sm">
                                {transaction.providerTransactionId}
                            </p>
                        </div>
                    )}
                    {transaction.key && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Deduplication Key
                            </label>
                            <p className="mt-1 font-mono text-sm">{transaction.key}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
