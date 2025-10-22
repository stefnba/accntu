'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AccountCount } from '@/features/bank/components/account-count';
import { AccountTypeBadge } from '@/features/bank/components/account-type';
import { BankLogo } from '@/features/bank/components/bank-logo';
import { IntegrationTypeBadge } from '@/features/bank/components/integration-type';
import { TConnectedBank, TConnectedBankAccount } from '@/features/bank/schemas/';
import { typedEntries } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ConnectedBankCardProps {
    bank: TConnectedBank;
}

export const ConnectedBankCard: React.FC<ConnectedBankCardProps> = ({ bank }) => {
    const router = useRouter();

    const accountTypeCounts = bank.connectedBankAccounts.reduce(
        (acc: Record<string, number>, account) => {
            const type = account.type || 'checking';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const MenuDropdown = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/banks/${bank.id}`);
                    }}
                >
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Disconnect Bank</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const { globalBank, connectedBankAccounts } = bank;
    const integrationTypes = globalBank?.integrationTypes;

    const uniqueAccountTypes = connectedBankAccounts.reduce(
        (acc, account) => {
            const type = account.type || 'checking';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        },
        {} as Record<Exclude<TConnectedBankAccount['type'], null>, number>
    );

    return (
        <Link href={`/banks/${bank.id}`} className="block">
            <Card className="group transition-all duration-200 hover:shadow-lg hover:shadow-gray-100 border-gray-200">
                <CardContent className="">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <BankLogo
                                logoUrl={bank.globalBank?.logo}
                                color={bank.globalBank?.color}
                                size="lg"
                            />
                            <div>
                                <CardTitle size="xl">
                                    {bank.globalBank?.name || 'Unknown Bank'}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <IntegrationTypeBadge
                                        integrationType={bank.globalBank?.integrationTypes}
                                    />
                                    <span className="text-muted-foreground">•</span>
                                    <AccountCount count={bank.connectedBankAccounts?.length} />
                                    <span className="text-muted-foreground">•</span>
                                    <span className="">
                                        Last updated{' '}
                                        {new Date(
                                            bank.updatedAt || bank.createdAt
                                        ).toLocaleDateString('en-US', {
                                            month: 'numeric',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </CardDescription>
                            </div>
                        </div>
                        {/* <MenuDropdown /> */}
                    </div>

                    {/* Connected Accounts Section */}
                    {Object.keys(accountTypeCounts).length > 0 && (
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                Connected Accounts
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {typedEntries(uniqueAccountTypes).map(([type, count]) => (
                                    <AccountTypeBadge
                                        key={type}
                                        accountType={type}
                                        name={type.toUpperCase()}
                                        info={count.toString()}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
};
