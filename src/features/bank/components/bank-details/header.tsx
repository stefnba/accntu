'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, CreditCard, RefreshCw } from 'lucide-react';

interface BankDetailsHeaderProps {
    bank: any;
}

export const BankDetailsHeader = ({ bank }: BankDetailsHeaderProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {bank.globalBank?.logo ? (
                            <div
                                className="size-20 rounded-2xl flex items-center justify-center shadow-sm border"
                                style={{
                                    backgroundColor: bank.globalBank.color || '#f8fafc',
                                }}
                            >
                                <img
                                    src={bank.globalBank.logo}
                                    alt={bank.globalBank.name}
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
                                {bank.globalBank?.name || 'Unknown Bank'}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 text-sm">
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Upload
                                </Badge>
                                <span className="flex items-center gap-1">
                                    <CreditCard className="h-4 w-4" />
                                    {bank.connectedBankAccounts?.length || 0} accounts
                                </span>
                                {bank.globalBank?.country && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="uppercase font-medium">
                                            {bank.globalBank.country}
                                        </span>
                                    </>
                                )}
                                <span className="text-gray-300">•</span>
                                <span>
                                    Connected {new Date(bank.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Sync
                        </Button>
                    </div>
                </div>

                {/* Custom Tab Navigation */}
                {/* <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-md w-fit">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                                    ${
                                        activeTab === tab.id
                                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                    }
                                `}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div> */}
            </div>
        </div>
    );
};
