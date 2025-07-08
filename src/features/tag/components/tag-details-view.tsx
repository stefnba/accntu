'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTagEndpoints } from '@/features/tag/api';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { formatCurrency } from '@/features/transaction/utils';
import { Edit2, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

interface TagDetailsViewProps {
    tagId: string | null;
    onClose: () => void;
    onEdit: (tagId: string) => void;
    onDelete: (tagId: string) => void;
}

export function TagDetailsView({ tagId, onClose, onEdit, onDelete }: TagDetailsViewProps) {
    const { data: tag } = useTagEndpoints.getById(
        { param: { id: tagId || '' } },
        { enabled: !!tagId }
    );
    const { data: transactionData } = useTransactionEndpoints.getAll(
        {
            query: {
                tagIds: tagId ? [tagId] : [],
                page: '1',
                pageSize: '10',
            },
        },
        { enabled: !!tagId }
    );

    const transactions = transactionData?.transactions || [];

    const stats = useMemo(() => {
        if (!transactions.length) return null;

        const totalAmount = transactions.reduce((sum, t) => sum + Number(t.userAmount), 0);
        const avgAmount = totalAmount / transactions.length;

        const byType = transactions.reduce(
            (acc, t) => {
                acc[t.type] = (acc[t.type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            totalAmount,
            avgAmount,
            transactionCount: transactions.length,
            byType,
        };
    }, [transactions]);

    if (!tag) return null;

    return (
        <Dialog open={!!tagId} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold">Tag Details</DialogTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => onEdit(tag.id)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                size="sm"
                                onClick={() => onDelete(tag.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Tag Info */}
                    <Card className="p-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-full"
                                style={{ backgroundColor: tag.color }}
                            />
                            <div>
                                <h3 className="text-xl font-semibold">{tag.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Created {new Date(tag.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Statistics */}
                    {stats && (
                        <Card className="p-4">
                            <h3 className="font-semibold mb-4">Statistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Transactions
                                    </p>
                                    <p className="text-2xl font-semibold">
                                        {stats.transactionCount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                    <p className="text-2xl font-semibold">
                                        {formatCurrency(stats.totalAmount, 'USD')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Amount</p>
                                    <p className="text-2xl font-semibold">
                                        {formatCurrency(stats.avgAmount, 'USD')}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Recent Transactions */}
                    <Card className="p-4">
                        <h3 className="font-semibold mb-4">Recent Transactions</h3>
                        <div className="space-y-2">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{transaction.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <p
                                        className={
                                            transaction.type === 'credit'
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }
                                    >
                                        {formatCurrency(
                                            Number(transaction.userAmount),
                                            transaction.userCurrency
                                        )}
                                    </p>
                                </div>
                            ))}

                            {transactions.length === 0 && (
                                <p className="text-center py-4 text-muted-foreground">
                                    No transactions found with this tag.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
