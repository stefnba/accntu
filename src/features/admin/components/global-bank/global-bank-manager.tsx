'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminGlobalBankEndpoints } from '@/features/admin/api/global-bank';
import {
    Building2,
    Coins,
    CreditCard,
    Edit,
    Eye,
    Globe,
    MapPin,
    Plus,
    Search,
    Settings,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { GlobalBankForm } from './global-bank-form';

export const GlobalBankManager = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<any>(null);
    const [deletingBank, setDeletingBank] = useState<any>(null);

    const { data: banks, isLoading } = useAdminGlobalBankEndpoints.getAll({
        query: {
            query: searchQuery,
            country: selectedCountry,
        },
    });

    const deleteBank = useAdminGlobalBankEndpoints.remove();

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

    const handleDelete = async (bank: any) => {
        await deleteBank.mutateAsync({ param: { id: bank.id } });
        setDeletingBank(null);
    };

    const getStatusColor = (bank: any) => {
        if (!bank.isActive) return 'destructive';
        return 'default';
    };

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
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="text-muted-foreground">Loading banks...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold text-gray-900">Global Banks</h1>
                        <p className="text-gray-600">
                            Manage global bank templates and account configurations
                        </p>
                    </div>
                    <Button onClick={handleAdd} className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        Add Bank
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search banks by name, BIC, or provider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Country (DE, CH, etc.)"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value.toUpperCase())}
                            className="w-48 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            maxLength={2}
                        />
                    </div>
                </div>
            </div>

            {/* Banks Grid */}
            {banks?.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
                    <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No banks found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {searchQuery || selectedCountry
                            ? 'Try adjusting your search criteria to find more banks'
                            : 'Get started by adding your first global bank template'}
                    </p>
                    {!searchQuery && !selectedCountry && (
                        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Bank
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {banks?.map((bank) => (
                        <Card
                            key={bank.id}
                            className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-blue-300"
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
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
                                            <CardTitle className="text-lg text-gray-900">
                                                {bank.name}
                                            </CardTitle>
                                            {bank.bic && (
                                                <p className="text-xs text-gray-500 font-mono">
                                                    BIC: {bank.bic}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Link href={`/admin/banks/${bank.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(bank)}
                                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingBank(bank)}
                                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-4">
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

                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={getStatusColor(bank)}
                                            className={
                                                bank.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }
                                        >
                                            {bank.isActive ? 'Active' : 'Inactive'}
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

                                    {bank.integrationTypes && bank.integrationTypes.length > 0 && (
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
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {isFormOpen && <GlobalBankForm bank={editingBank} onClose={handleFormClose} />}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingBank} onOpenChange={() => setDeletingBank(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Bank Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingBank?.name}"? This action
                            cannot be undone and will also remove all associated account templates.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingBank && handleDelete(deletingBank)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Bank
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
