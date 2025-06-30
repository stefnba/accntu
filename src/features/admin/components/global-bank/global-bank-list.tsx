'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminGlobalBankEndpoints } from '@/features/admin/api/global-bank';
import { Building2, Coins, CreditCard, Eye, Globe, MapPin, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

interface GlobalBankListProps {
    onAdd?: () => void;
}

export const GlobalBankList = ({ onAdd }: GlobalBankListProps) => {
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
                {onAdd && (
                    <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bank
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {globalBanks.map((bank) => (
                <Card
                    key={bank.id}
                    className="group hover:shadow-md transition-all duration-200 border-gray-200 hover:border-blue-300"
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {bank.logo ? (
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border"
                                        style={{
                                            backgroundColor: bank.color || '#f8fafc',
                                        }}
                                    >
                                        <img
                                            src={bank.logo}
                                            alt={bank.name}
                                            className="w-8 h-8 object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-gray-600" />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-gray-900">{bank.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1 bg-gray-100 text-gray-700"
                                        >
                                            <MapPin className="h-3 w-3" />
                                            {bank.country}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="flex items-center gap-1 border-gray-200"
                                        >
                                            <Coins className="h-3 w-3" />
                                            {bank.currency}
                                        </Badge>
                                        {bank.providerSource && (
                                            <Badge
                                                variant="outline"
                                                className="flex items-center gap-1 border-gray-200"
                                            >
                                                {getProviderIcon(bank.providerSource)}
                                                {bank.providerSource}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={bank.isActive ? 'default' : 'destructive'}
                                    className={
                                        bank.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }
                                >
                                    {bank.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Link href={`/admin/banks/${bank.id}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
