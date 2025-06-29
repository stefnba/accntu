'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, CreditCard, Edit, Settings } from 'lucide-react';

interface GlobalBankDetailsHeaderProps {
    bank: any;
    onEdit?: () => void;
}

export const GlobalBankDetailsHeader = ({ bank, onEdit }: GlobalBankDetailsHeaderProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {bank.logo ? (
                            <div
                                className="size-20 rounded-2xl flex items-center justify-center shadow-sm border"
                                style={{
                                    backgroundColor: bank.color || '#f8fafc',
                                }}
                            >
                                <img
                                    src={bank.logo}
                                    alt={bank.name}
                                    className="size-12 object-contain"
                                />
                            </div>
                        ) : (
                            <div className="size-20 rounded-2xl bg-gray-50 flex items-center justify-center shadow-sm border">
                                <Building2 className="h-10 w-10 text-gray-600" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                                {bank.name}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 text-sm">
                                <Badge
                                    variant="outline"
                                    className={
                                        bank.isActive
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }
                                >
                                    {bank.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="flex items-center gap-1">
                                    <CreditCard className="h-4 w-4" />
                                    Global Template
                                </span>
                                {bank.country && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="uppercase font-medium">
                                            {bank.country}
                                        </span>
                                    </>
                                )}
                                {bank.currency && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="font-medium">{bank.currency}</span>
                                    </>
                                )}
                                <span className="text-gray-300">•</span>
                                <span>Created {new Date(bank.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {onEdit && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEdit}
                                className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                        )}
                        <Button variant="outline" size="sm" disabled className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
