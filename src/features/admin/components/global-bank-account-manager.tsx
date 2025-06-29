'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Code, Settings } from 'lucide-react';
import { useGlobalBankEndpoints } from '@/features/bank/api/global-bank';
import { useGlobalBankAccountEndpoints } from '@/features/bank/api/global-bank-account';
import { GlobalBankAccountForm } from './global-bank-account-form';

export const GlobalBankAccountManager = () => {
    const [selectedBankId, setSelectedBankId] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<any>(null);

    const { data: banks } = useGlobalBankEndpoints.getAll({});
    const { data: accounts, isLoading } = useGlobalBankAccountEndpoints.getByBankId(
        { param: { id: selectedBankId } },
        { enabled: !!selectedBankId }
    );

    const selectedBank = banks?.find(bank => bank.id === selectedBankId);

    const handleEdit = (account: any) => {
        setEditingAccount(account);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        if (!selectedBankId) return;
        setEditingAccount(null);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingAccount(null);
    };

    const getAccountTypeColor = (type: string) => {
        const colors = {
            checking: 'bg-blue-100 text-blue-800',
            savings: 'bg-green-100 text-green-800',
            credit_card: 'bg-purple-100 text-purple-800',
            investment: 'bg-orange-100 text-orange-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Global Bank Accounts</h2>
                <Button 
                    onClick={handleAdd} 
                    disabled={!selectedBankId}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Account
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a bank to manage accounts" />
                        </SelectTrigger>
                        <SelectContent>
                            {banks?.map((bank) => (
                                <SelectItem key={bank.id} value={bank.id}>
                                    {bank.name} ({bank.country})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {selectedBank && (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{selectedBank.country}</Badge>
                        <Badge variant="outline">{selectedBank.currency}</Badge>
                    </div>
                )}
            </div>

            {selectedBankId && (
                <>
                    {isLoading ? (
                        <div>Loading accounts...</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                            {accounts?.map((account) => (
                                <Card key={account.id} className="h-fit">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{account.name}</CardTitle>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(account)}
                                                    title="Edit Account"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    title="Delete Account"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Badge 
                                                    className={getAccountTypeColor(account.type)}
                                                    variant="secondary"
                                                >
                                                    {account.type.replace('_', ' ')}
                                                </Badge>
                                                <Badge 
                                                    variant={account.isActive ? "default" : "secondary"}
                                                >
                                                    {account.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>

                                            {account.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {account.description}
                                                </p>
                                            )}

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Code className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Transform Query:</span>
                                                </div>
                                                <div className="bg-muted rounded p-2 text-xs font-mono max-h-20 overflow-y-auto">
                                                    {account.transformQuery || 'No transform query defined'}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">CSV Config:</span>
                                                </div>
                                                <div className="bg-muted rounded p-2 text-xs">
                                                    {account.csvConfig ? (
                                                        <div className="space-y-1">
                                                            <div>Delimiter: {account.csvConfig.delimiter || ','}</div>
                                                            <div>Header: {account.csvConfig.hasHeader ? 'Yes' : 'No'}</div>
                                                            <div>Encoding: {account.csvConfig.encoding || 'utf-8'}</div>
                                                        </div>
                                                    ) : (
                                                        'No CSV config defined'
                                                    )}
                                                </div>
                                            </div>

                                            {account.sampleCsvData && (
                                                <div className="space-y-2">
                                                    <div className="text-sm text-muted-foreground">Sample Data:</div>
                                                    <div className="bg-muted rounded p-2 text-xs font-mono max-h-20 overflow-y-auto">
                                                        {account.sampleCsvData.split('\n').slice(0, 3).join('\n')}
                                                        {account.sampleCsvData.split('\n').length > 3 && '\n...'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {accounts?.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                No accounts found for this bank
                            </p>
                        </div>
                    )}
                </>
            )}

            {!selectedBankId && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        Select a bank to view and manage its account templates
                    </p>
                </div>
            )}

            {isFormOpen && selectedBankId && (
                <GlobalBankAccountForm
                    account={editingAccount}
                    bankId={selectedBankId}
                    onClose={handleFormClose}
                />
            )}
        </div>
    );
};