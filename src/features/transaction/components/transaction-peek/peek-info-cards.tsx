import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconMapPin } from '@tabler/icons-react';

import { useTransactionEndpoints } from '@/features/transaction/api';
import { useTransactionPeek } from '@/features/transaction/hooks';

export const PeekInfoCards = () => {
    const { peekTransactionId } = useTransactionPeek();

    const { data: transaction } = useTransactionEndpoints.getById(
        {
            param: { id: peekTransactionId! },
        },
        {
            enabled: !!peekTransactionId,
        }
    );

    if (!transaction) return null;
    return (
        <div className="grid grid-cols-1 gap-3">
            {/* Account Info */}
            {transaction.account && (
                <Card className="p-3">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Account
                        </p>
                        <p className="font-medium">{transaction.account.name}</p>
                        {transaction.account.connectedBank?.globalBank && (
                            <p
                                className="text-sm"
                                style={{
                                    color:
                                        transaction.account.connectedBank.globalBank.color ||
                                        undefined,
                                }}
                            >
                                {transaction.account.connectedBank.globalBank.name}
                            </p>
                        )}
                    </div>
                </Card>
            )}

            {/* Categories */}
            {(transaction.label || (transaction.tags && transaction.tags.length > 0)) && (
                <Card className="p-3">
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Categories
                        </p>
                        <div className="space-y-2">
                            {transaction.label && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Label</p>
                                    <Badge
                                        variant="outline"
                                        style={{
                                            borderColor: transaction.label.color || undefined,
                                            color: transaction.label.color || undefined,
                                        }}
                                    >
                                        {transaction.label.name}
                                    </Badge>
                                </div>
                            )}
                            {transaction.tags && transaction.tags.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Tags</p>
                                    <div className="flex flex-wrap gap-1">
                                        {transaction.tags.map((tag) => (
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
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Location */}
            {(transaction.city || transaction.country) && (
                <Card className="p-3">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Location
                        </p>
                        <div className="flex items-center">
                            <IconMapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                            <div>
                                {transaction.city && (
                                    <p className="font-medium">{transaction.city}</p>
                                )}
                                {transaction.country && (
                                    <p className="text-sm text-muted-foreground">
                                        {transaction.country}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Banking Details */}
            {(transaction.counterparty || transaction.reference || transaction.iban) && (
                <Card className="p-3">
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Banking Details
                        </p>
                        <div className="space-y-1 text-sm">
                            {transaction.counterparty && (
                                <div>
                                    <span className="font-medium text-muted-foreground">
                                        Counterparty:{' '}
                                    </span>
                                    {transaction.counterparty}
                                </div>
                            )}
                            {transaction.reference && (
                                <div>
                                    <span className="font-medium text-muted-foreground">
                                        Reference:{' '}
                                    </span>
                                    {transaction.reference}
                                </div>
                            )}
                            {transaction.iban && (
                                <div>
                                    <span className="font-medium text-muted-foreground">
                                        IBAN:{' '}
                                    </span>
                                    {transaction.iban}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Description/Note */}
            {(transaction.description || transaction.note) && (
                <Card className="p-3">
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Notes
                        </p>
                        {transaction.description && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Description</p>
                                <p className="text-sm">{transaction.description}</p>
                            </div>
                        )}
                        {transaction.note && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Note</p>
                                <p className="text-sm">{transaction.note}</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};
