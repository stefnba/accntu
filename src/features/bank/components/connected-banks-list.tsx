'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConnectedBankEndpoints } from '@/features/bank/api';
import { useAddBankModal } from '@/features/bank/hooks';
import { Building2, Plus } from 'lucide-react';
import { ConnectedBankCard } from './bank-cards';

const AddBankCard = () => {
    const { openModal } = useAddBankModal();

    return (
        <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <Plus className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Add New Bank</h3>
                        <p className="text-sm text-gray-500">
                            Connect another bank account to manage all your finances in one place
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="group-hover:bg-gray-50"
                        onClick={() => openModal()}
                    >
                        Connect Bank
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export const ConnectedBanksList = () => {
    const { data: banks, isLoading, error } = useConnectedBankEndpoints.getAll({ query: {} });

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                                    <div className="space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-40" />
                                        <div className="h-4 bg-gray-200 rounded w-48" />
                                    </div>
                                </div>
                                <div className="w-6 h-6 bg-gray-200 rounded" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-32" />
                                <div className="flex gap-3">
                                    <div className="h-10 bg-gray-200 rounded-lg w-28" />
                                    <div className="h-10 bg-gray-200 rounded-lg w-24" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unable to load banks
                    </h3>
                    <p className="text-gray-500 mb-4">
                        There was an error loading your connected banks. Please try again later.
                    </p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </Card>
        );
    }

    if (!banks || banks.length === 0) {
        return (
            <div className="space-y-4">
                <AddBankCard />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {banks.map((bank) => (
                <ConnectedBankCard key={bank.id} bank={bank} />
            ))}
        </div>
    );
};
