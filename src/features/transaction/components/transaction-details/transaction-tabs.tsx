import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { format } from 'date-fns';
import Link from 'next/link';
import { formatCurrency } from '../../utils';

interface TransactionTabsProps {
    transactionId: string;
}

export const TransactionTabs = ({ transactionId }: TransactionTabsProps) => {
    const { data: transaction } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (!transaction) return null;

    return (
        <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="banking">Banking Info</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transaction Details */}
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
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Note
                                    </label>
                                    <p className="mt-1">{transaction.note}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Transaction Date
                                </label>
                                <p className="mt-1">{format(new Date(transaction.date), 'PPP')}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Type
                                </label>
                                <p className="mt-1 capitalize">{transaction.type}</p>
                            </div>
                            {transaction.status && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </label>
                                    <p className="mt-1 capitalize">{transaction.status}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Balance Information */}
                    {transaction.balance && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Balance Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Account Balance After Transaction
                                    </label>
                                    <p className="mt-1 text-lg font-semibold">
                                        {formatCurrency(
                                            parseFloat(transaction.balance),
                                            transaction.accountCurrency || 'EUR'
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="banking" className="space-y-4">
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
                                    <p className="mt-1 font-mono text-sm">
                                        {transaction.reference}
                                    </p>
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
                                    <label className="text-sm font-medium text-muted-foreground">
                                        BIC
                                    </label>
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
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Created At
                                </label>
                                <p className="mt-1">
                                    {format(new Date(transaction.createdAt), 'PPP p')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Updated At
                                </label>
                                <p className="mt-1">
                                    {format(new Date(transaction.updatedAt || ''), 'PPP p')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Transaction ID
                                </label>
                                <p className="mt-1 font-mono text-sm">{transaction.id}</p>
                            </div>
                            {transaction.linkedTransactionId && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Linked Transaction
                                    </label>
                                    <Link
                                        href={`/transactions/${transaction.linkedTransactionId}`}
                                        className="mt-1 text-blue-600 hover:text-blue-800 font-mono text-sm"
                                    >
                                        {transaction.linkedTransactionId}
                                    </Link>
                                </div>
                            )}
                            {transaction.importFile && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Import Source
                                    </label>
                                    <p className="mt-1">File ID: {transaction.importFileId}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};
