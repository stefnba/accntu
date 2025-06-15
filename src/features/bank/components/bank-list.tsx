'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useConnectedBankEndpoints } from '@/features/bank/api';
import { useAddBankModal } from '@/features/bank/hooks';
import { AlertCircle, Building2 } from 'lucide-react';
import { AddBankCard } from './add-bank-card';
import { BankCard } from './bank-card';

interface BankListProps {}

export const BankList: React.FC<BankListProps> = () => {
    const { openModal } = useAddBankModal();

    const { data: banksData = [], isLoading, error } = useConnectedBankEndpoints.getAll({});

    const handleEdit = (id: string) => {};

    const handleDelete = (id: string) => {};

    const handleToggleVisibility = (id: string) => {
        // Handle visibility toggle if needed
        console.log('Toggle visibility for bank:', id);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BankCardSkeleton />
                <BankCardSkeleton />
                <BankCardSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load bank accounts. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    const hasAccounts = banksData && banksData.length > 0;

    if (!hasAccounts) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">No Bank Accounts Connected</h3>
                    <p className="text-muted-foreground max-w-md">
                        Connect your first bank account to start managing your finances and tracking
                        transactions.
                    </p>
                </div>
                <div className="max-w-sm w-full">
                    <AddBankCard onAddBank={openModal} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AddBankCard onAddBank={openModal} />
                {banksData.map((account: any) => (
                    <BankCard
                        key={account.id}
                        id={account.id}
                        bankName={account.connectedBank?.globalBank?.name || 'Unknown Bank'}
                        bankIcon={account.connectedBank?.globalBank?.logoUrl}
                        accountNumber={account.accountNumber || '0000000000000000'}
                        accountHolderName={account.accountHolderName || 'Account Holder'}
                        expiryDate={account.expiryDate}
                        accountType={account.accountType || 'Checking'}
                        isActive={account.isActive ?? true}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleVisibility={handleToggleVisibility}
                    />
                ))}
            </div>

            {hasAccounts && (
                <div className="text-center text-sm text-muted-foreground">
                    {banksData.length} account{banksData.length !== 1 ? 's' : ''} connected
                </div>
            )}
        </div>
    );
};

const BankCardSkeleton = () => (
    <div className="space-y-4 p-6 border rounded-lg">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            <Skeleton className="w-8 h-8" />
        </div>
        <Skeleton className="h-8 w-full" />
        <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
        </div>
    </div>
);
