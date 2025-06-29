'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminGlobalBankEndpoints } from '@/features/admin/api/global-bank';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { GlobalBankForm } from './global-bank-form';

export const GlobalBankManager = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<any>(null);

    const { data: banks, isLoading } = useAdminGlobalBankEndpoints.getAll({
        query: {
            query: searchQuery,
            country: selectedCountry,
        },
    });

    const handleEdit = (bank: any) => {
        setEditingBank(bank);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingBank(null);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingBank(null);
    };

    if (isLoading) {
        return <div>Loading banks...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Global Banks</h2>
                <Button onClick={handleAdd} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Bank
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search banks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Input
                    placeholder="Country (DE, CH, etc.)"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value.toUpperCase())}
                    className="w-48"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {banks?.map((bank) => (
                    <Card key={bank.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{bank.name}</CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(bank)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{bank.country}</Badge>
                                    <Badge variant="outline">{bank.currency}</Badge>
                                </div>
                                {bank.bic && (
                                    <p className="text-sm text-muted-foreground">BIC: {bank.bic}</p>
                                )}
                                <div className="flex items-center gap-2">
                                    <Badge variant={bank.isActive ? 'default' : 'secondary'}>
                                        {bank.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {bank.providerSource && (
                                        <Badge variant="outline">{bank.providerSource}</Badge>
                                    )}
                                </div>
                                {bank.integrationTypes && (
                                    <div className="flex gap-1">
                                        {bank.integrationTypes.map((type: string) => (
                                            <Badge key={type} variant="outline" className="text-xs">
                                                {type}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {banks?.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No banks found</p>
                </div>
            )}

            {isFormOpen && <GlobalBankForm bank={editingBank} onClose={handleFormClose} />}
        </div>
    );
};
