'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useImportModal } from '@/features/transaction-import/hooks';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { TTransactionParseDuplicateCheck } from '@/features/transaction/schemas';
import { AlertCircle, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PreviewProps {
    parseResult: {
        transactions: TTransactionParseDuplicateCheck[];
        totalCount: number;
        newCount: number;
        duplicateCount: number;
    };
}

export const Preview: React.FC<PreviewProps> = ({
    parseResult: { transactions, totalCount, newCount, duplicateCount },
}) => {
    const { activeFileId, setCurrentStep } = useImportModal();
    const [isImporting, setIsImporting] = useState(false);

    const { mutateAsync: importTransactions } = useTransactionEndpoints.import();

    const handleImport = async () => {
        if (!activeFileId) return;

        setIsImporting(true);
        try {
            await importTransactions({
                json: {
                    transactions: transactions.filter((t) => !t.isDuplicate),
                    importFileId: activeFileId,
                },
            });

            setCurrentStep('success');
        } catch (error) {
            console.error('Import error:', error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="space-y-6 w-3xl">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>

                <h3 className="text-lg font-semibold">Review Transactions</h3>
                <p className="text-sm text-muted-foreground">
                    Review the parsed transactions before importing
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{totalCount}</div>
                    <div className="text-sm text-muted-foreground">Total Found</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{newCount}</div>
                    <div className="text-sm text-green-600">New Transactions</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{duplicateCount}</div>
                    <div className="text-sm text-orange-600">Duplicates</div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="space-y-3">
                <h4 className="font-medium">Transaction Preview</h4>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="font-mono text-sm">
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-xs truncate">{transaction.title}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        {transaction.spendingAmount} {transaction.spendingCurrency}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {transaction.isDuplicate ? (
                                            <Badge
                                                variant="outline"
                                                className="text-orange-600 border-orange-200"
                                            >
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Duplicate
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="text-green-600 border-green-200"
                                            >
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                New
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {transactions.length > 10 && (
                        <div className="p-3 bg-muted/50 text-center text-sm text-muted-foreground">
                            Showing first 10 of {totalCount} transactions
                        </div>
                    )}
                </div>
            </div>

            {duplicateCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="space-y-1">
                            <h5 className="font-medium text-orange-800">
                                Duplicate Transactions Found
                            </h5>
                            <p className="text-sm text-orange-700">
                                {duplicateCount} transactions already exist in your account and will
                                be skipped during import.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => setCurrentStep('upload')}
                    disabled={isImporting}
                >
                    Back to Upload
                </Button>

                <Button
                    variant="outline"
                    // onClick={() => parseTransactions.mutate({ param: { id: activeFileId! } })}
                >
                    Reparse File
                </Button>

                <Button
                    onClick={handleImport}
                    disabled={isImporting || newCount === 0}
                    className="flex-1"
                >
                    {isImporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4 mr-2" />
                    )}
                    {isImporting ? 'Importing...' : `Import ${newCount} Transactions`}
                </Button>
            </div>
        </div>
    );
};
