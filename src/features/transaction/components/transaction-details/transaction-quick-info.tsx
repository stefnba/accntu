import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    IconBuilding, 
    IconTag, 
    IconMapPin, 
    IconCreditCard 
} from '@tabler/icons-react';
import { TransactionWithRelations } from '../transaction-columns';
import { formatCurrency } from '../../utils';

interface TransactionQuickInfoProps {
    transaction: TransactionWithRelations;
}

export const TransactionQuickInfo = ({ transaction }: TransactionQuickInfoProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Account Info */}
            {transaction.account && (
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <IconBuilding className="w-4 h-4 mr-2 text-muted-foreground" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Account
                                </p>
                            </div>
                            <p className="font-medium">{transaction.account.name}</p>
                            <p className="text-sm text-muted-foreground">{transaction.account.type}</p>
                            {transaction.account.connectedBank?.globalBank && (
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: transaction.account.connectedBank.globalBank.color || undefined,
                                    }}
                                >
                                    {transaction.account.connectedBank.globalBank.name}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Categories */}
            {(transaction.label || (transaction.tags && transaction.tags.length > 0)) && (
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <IconTag className="w-4 h-4 mr-2 text-muted-foreground" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Categories
                                </p>
                            </div>
                            {transaction.label && (
                                <Badge
                                    variant="outline"
                                    style={{
                                        borderColor: transaction.label.color || undefined,
                                        color: transaction.label.color || undefined,
                                    }}
                                >
                                    {transaction.label.name}
                                </Badge>
                            )}
                            {transaction.tags && transaction.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {transaction.tags.slice(0, 3).map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="text-xs"
                                            style={{
                                                backgroundColor: `${tag.color}20`,
                                                borderColor: tag.color,
                                                color: tag.color,
                                            }}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                    {transaction.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{transaction.tags.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Location */}
            {(transaction.city || transaction.country) && (
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <IconMapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Location
                                </p>
                            </div>
                            {transaction.city && (
                                <p className="font-medium">{transaction.city}</p>
                            )}
                            {transaction.country && (
                                <p className="text-sm text-muted-foreground">
                                    {transaction.country}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Amount Details */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <IconCreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Amount Details
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Spending:</span>{' '}
                                {formatCurrency(parseFloat(transaction.spendingAmount), transaction.spendingCurrency)}
                            </div>
                            {transaction.accountAmount && transaction.accountCurrency && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Account:</span>{' '}
                                    {formatCurrency(parseFloat(transaction.accountAmount), transaction.accountCurrency)}
                                </div>
                            )}
                            {transaction.userAmount && transaction.userCurrency && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">User:</span>{' '}
                                    {formatCurrency(parseFloat(transaction.userAmount), transaction.userCurrency)}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};