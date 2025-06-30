'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, Database, Settings, Shield, Trash2 } from 'lucide-react';

interface GlobalBankDetailsSettingsProps {
    bank: any;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const GlobalBankDetailsSettings = ({
    bank,
    onEdit,
    onDelete,
}: GlobalBankDetailsSettingsProps) => {
    return (
        <div className="space-y-6">
            {/* Configuration Settings */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Settings className="h-5 w-5 text-blue-600" />
                        Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Provider Configuration</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Source:</span>
                                    <Badge variant="outline" className="capitalize">
                                        {bank.providerSource}
                                    </Badge>
                                </div>
                                {bank.providerId && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Provider ID:</span>
                                        <span className="text-sm font-mono text-gray-900">
                                            {bank.providerId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Integration Settings</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <Badge variant={bank.isActive ? 'default' : 'destructive'}>
                                        {bank.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Types:</span>
                                    <div className="flex gap-1">
                                        {bank.integrationTypes?.map((type: string) => (
                                            <Badge key={type} variant="outline" className="text-xs">
                                                {type.toUpperCase()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
                            Edit Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Data & Statistics */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Database className="h-5 w-5 text-green-600" />
                        Data & Usage
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">0</div>
                            <div className="text-sm text-gray-600">Connected Users</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">0</div>
                            <div className="text-sm text-gray-600">Account Templates</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">0</div>
                            <div className="text-sm text-gray-600">Total Transactions</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Metadata</h4>
                        <div className="grid gap-2 md:grid-cols-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Created: {new Date(bank.createdAt).toLocaleDateString()}
                            </div>
                            {bank.updatedAt !== bank.createdAt && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Updated: {new Date(bank.updatedAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security & Permissions */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Shield className="h-5 w-5 text-purple-600" />
                        Security & Permissions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            This is a global bank template that affects all users who connect to
                            this bank. Changes made here will impact existing and future
                            connections.
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-800">
                                Modifying or deleting this template may affect active user
                                connections
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 bg-red-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-900">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium text-red-900">Delete Bank Template</h4>
                        <p className="text-sm text-red-700">
                            Permanently delete this bank template and all associated account
                            templates. This action cannot be undone and will affect all users
                            connected to this bank.
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Bank Template
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
