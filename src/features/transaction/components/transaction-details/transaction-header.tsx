import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconCalendar, IconEdit, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { TransactionWithRelations } from '../transaction-columns';
import { formatCurrency, getTypeIcon, getTypeColor, getAmountWithSign, getTypeBadgeVariant } from '../../utils';

interface TransactionHeaderProps {
    transaction: TransactionWithRelations;
}

export const TransactionHeader = ({ transaction }: TransactionHeaderProps) => {
    return (
        <Card className="border-gray-200">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {transaction.title}
                                    </h1>
                                    <Badge
                                        variant={getTypeBadgeVariant(transaction.type)}
                                        className="capitalize"
                                    >
                                        {React.createElement(getTypeIcon(transaction.type), {
                                            className: 'w-3 h-3 mr-1',
                                        })}
                                        {transaction.type}
                                    </Badge>
                                    {transaction.isNew && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                            New
                                        </Badge>
                                    )}
                                </div>
                                {transaction.originalTitle && 
                                 transaction.originalTitle !== transaction.title && (
                                    <p className="text-sm text-muted-foreground">
                                        Originally: {transaction.originalTitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className={`text-3xl font-bold ${getTypeColor(transaction.type)}`}>
                            {formatCurrency(
                                getAmountWithSign(
                                    parseFloat(transaction.spendingAmount),
                                    transaction.type
                                ),
                                transaction.spendingCurrency
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <IconCalendar className="w-4 h-4 mr-2" />
                                {format(new Date(transaction.date), 'PPP')} at {format(new Date(transaction.date), 'p')}
                            </div>
                            {transaction.status && (
                                <Badge 
                                    variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                                    className="capitalize"
                                >
                                    {transaction.status}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <IconEdit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm">
                            <IconTrash className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};