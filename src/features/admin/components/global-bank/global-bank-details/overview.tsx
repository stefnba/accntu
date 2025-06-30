'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Building2,
    Calendar,
    Coins,
    CreditCard,
    Globe,
    Info,
    MapPin,
    Settings,
} from 'lucide-react';

interface GlobalBankDetailsOverviewProps {
    bank: any;
}

export const GlobalBankDetailsOverview = ({ bank }: GlobalBankDetailsOverviewProps) => {
    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'nordigen':
                return <Globe className="h-4 w-4" />;
            case 'plaid':
                return <CreditCard className="h-4 w-4" />;
            case 'open-banking':
                return <Building2 className="h-4 w-4" />;
            default:
                return <Settings className="h-4 w-4" />;
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Information */}
            <Card className="border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Info className="h-5 w-5 text-blue-600" />
                        Basic Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Bank Name
                            </p>
                            <p className="text-sm font-medium text-gray-900">{bank.name}</p>
                        </div>
                        {bank.bic && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    BIC Code
                                </p>
                                <p className="text-sm font-mono text-gray-900">{bank.bic}</p>
                            </div>
                        )}
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
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Provider Information */}
            <Card className="border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Globe className="h-5 w-5 text-green-600" />
                        Provider Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Provider Source
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                {getProviderIcon(bank.providerSource)}
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                    {bank.providerSource}
                                </span>
                            </div>
                        </div>
                        {bank.providerId && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Provider ID
                                </p>
                                <p className="text-sm font-mono text-gray-900">{bank.providerId}</p>
                            </div>
                        )}
                        {bank.integrationTypes && bank.integrationTypes.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Integration Types
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {bank.integrationTypes.map((type: string) => (
                                        <Badge
                                            key={type}
                                            variant="outline"
                                            className="text-xs border-blue-200 text-blue-700"
                                        >
                                            {type.toUpperCase()}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Status & Metadata */}
            <Card className="border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Status & Metadata
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Status
                            </p>
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
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Created
                            </p>
                            <p className="text-sm text-gray-900">
                                {new Date(bank.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        {bank.updatedAt !== bank.createdAt && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Last Updated
                                </p>
                                <p className="text-sm text-gray-900">
                                    {new Date(bank.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Visual Branding */}
            {(bank.logo || bank.color) && (
                <Card className="border-gray-200 md:col-span-2 lg:col-span-3">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Building2 className="h-5 w-5 text-orange-600" />
                            Visual Branding
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            {bank.logo && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Logo
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm border"
                                            style={{
                                                backgroundColor: bank.color || '#f8fafc',
                                            }}
                                        >
                                            <img
                                                src={bank.logo}
                                                alt={bank.name}
                                                className="w-10 h-10 object-contain"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 break-all">
                                                {bank.logo}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {bank.color && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Brand Color
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg border shadow-sm"
                                            style={{ backgroundColor: bank.color }}
                                        />
                                        <p className="text-sm font-mono text-gray-900">
                                            {bank.color}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
