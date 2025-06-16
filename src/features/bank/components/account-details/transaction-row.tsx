'use client';

import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionRowProps {
    transaction: {
        id: string;
        amount: string;
        description?: string;
        reference?: string;
        date: string;
        category?: string;
        balance?: string;
        currency?: string;
    };
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => {
    const isDebit = parseFloat(transaction.amount) < 0;

    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={cn('p-2 rounded-full', isDebit ? 'bg-red-50' : 'bg-green-50')}>
                    {isDebit ? (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                    ) : (
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                    )}
                </div>
                <div>
                    <p className="font-medium text-gray-900">
                        {transaction.description || transaction.reference || 'Transaction'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        {transaction.category && (
                            <>
                                <span>•</span>
                                <span>{transaction.category}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p
                    className={cn(
                        'font-semibold text-lg',
                        isDebit ? 'text-red-600' : 'text-green-600'
                    )}
                >
                    {isDebit ? '' : '+'}
                    {parseFloat(transaction.amount).toLocaleString('en-US', {
                        style: 'currency',
                        currency: transaction.currency || 'EUR',
                    })}
                </p>
                <p className="text-sm text-gray-500">
                    Balance:{' '}
                    {transaction.balance
                        ? parseFloat(transaction.balance).toLocaleString('en-US', {
                              style: 'currency',
                              currency: transaction.currency || 'EUR',
                          })
                        : 'N/A'}
                </p>
            </div>
        </div>
    );
};
