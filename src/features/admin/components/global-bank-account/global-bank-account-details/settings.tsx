'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, Database, FileText, Settings, Shield, Trash2 } from 'lucide-react';

interface GlobalBankAccountDetailsSettingsProps {
    account: any;
    bank?: any;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const GlobalBankAccountDetailsSettings = ({
    account,
    bank,
    onEdit,
    onDelete,
}: GlobalBankAccountDetailsSettingsProps) => {
    return (
        <div className="space-y-6">
            {/* Configuration Settings */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Settings className="h-5 w-5 text-blue-600" />
                        Template Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Account Settings</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Name:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {account.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Type:</span>
                                    <Badge variant="outline" className="capitalize">
                                        {account.type}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <Badge variant={account.isActive ? 'default' : 'destructive'}>
                                        {account.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">CSV Configuration</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Delimiter:</span>
                                    <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                        "{account.csvDelimiter || ','}"
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Header Row:</span>
                                    <Badge variant={account.csvHasHeader ? 'default' : 'secondary'}>
                                        {account.csvHasHeader ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Columns:</span>
                                    <span className="text-sm text-gray-900">
                                        {account.csvColumns
                                            ? Object.keys(account.csvColumns).length
                                            : 0}{' '}
                                        mapped
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
                            Edit Template
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* CSV Column Details */}
            {account.csvColumns && Object.keys(account.csvColumns).length > 0 && (
                <Card className="border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <FileText className="h-5 w-5 text-green-600" />
                            CSV Column Mapping
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(account.csvColumns).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{key}</p>
                                        <p className="text-xs text-gray-500">Field Name</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-900">{value as string}</p>
                                        <p className="text-xs text-gray-500">CSV Column</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bank Information */}
            {bank && (
                <Card className="border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Database className="h-5 w-5 text-purple-600" />
                            Associated Bank
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <div>
                                <h4 className="font-medium text-gray-900">{bank.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800"
                                    >
                                        {bank.country}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-blue-200 text-blue-700"
                                    >
                                        {bank.currency}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Provider</p>
                                <Badge variant="outline" className="capitalize">
                                    {bank.providerSource}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Data & Statistics */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Database className="h-5 w-5 text-orange-600" />
                        Usage Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">0</div>
                            <div className="text-sm text-gray-600">Connected Accounts</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">0</div>
                            <div className="text-sm text-gray-600">Total Imports</div>
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
                                Created: {new Date(account.createdAt).toLocaleDateString()}
                            </div>
                            {account.updatedAt !== account.createdAt && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Updated: {new Date(account.updatedAt).toLocaleDateString()}
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
                        <Shield className="h-5 w-5 text-indigo-600" />
                        Security & Permissions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            This is a global account template that affects all users who connect
                            accounts of this type. Changes made here will impact existing and future
                            account connections.
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-amber-800">
                                Modifying CSV configuration may affect existing import processes
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
                        <h4 className="font-medium text-red-900">Delete Account Template</h4>
                        <p className="text-sm text-red-700">
                            Permanently delete this account template and all its CSV configuration.
                            This action cannot be undone and will affect all users who use this
                            template.
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Template
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
