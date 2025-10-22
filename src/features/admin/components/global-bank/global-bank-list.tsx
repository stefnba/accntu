'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAdminGlobalBankEndpoints } from '@/features/admin/api/global-bank';
import { BankCard } from '@/features/bank/components/bank-card/bank-card';
import { BankLogo } from '@/features/bank/components/bank-logo';
import { Building2, CreditCard, Globe, Settings } from 'lucide-react';
import { Route } from 'next';

interface GlobalBankListProps {
    className?: string;
}

export const GlobalBankList: React.FC<GlobalBankListProps> = () => {
    const { data: globalBanks, isLoading } = useAdminGlobalBankEndpoints.getAll({
        query: {},
    });

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'nordigen':
                return <Globe className="h-3 w-3" />;
            case 'plaid':
                return <CreditCard className="h-3 w-3" />;
            case 'open-banking':
                return <Building2 className="h-3 w-3" />;
            default:
                return <Settings className="h-3 w-3" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!globalBanks || globalBanks.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No global banks found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Get started by adding your first global bank template
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {globalBanks.map(({ id, name, logo, color }) => (
                // <Link key={id} href={`/admin/banks/${id}`}>
                <BankCard key={id} href={`/admin/banks/${id}` as Route}>
                    <BankCard.Icon>
                        <BankLogo logoUrl={logo} color={color} size="lg" />
                    </BankCard.Icon>
                    <BankCard.Header>
                        <BankCard.Title>{name}</BankCard.Title>
                    </BankCard.Header>
                    <BankCard.ActionsDropdown>
                        <DropdownMenuItem
                            onClick={(e) => {
                                // e.preventDefault();
                                e.stopPropagation();
                                alert('ddd');
                            }}
                        >
                            ddd
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                // e.preventDefault();
                                e.stopPropagation();
                                alert('ddd2');
                            }}
                        >
                            ddd
                        </DropdownMenuItem>
                    </BankCard.ActionsDropdown>
                </BankCard>
                // </Link>
            ))}
        </div>
    );
};
