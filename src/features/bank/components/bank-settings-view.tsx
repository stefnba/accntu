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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useConnectedBankEndpoints } from '@/features/bank/api';
import {
    AlertTriangle,
    Bell,
    Building2,
    CheckCircle,
    Clock,
    Download,
    Key,
    RefreshCw,
    Settings,
    Shield,
    Trash2,
    Upload,
    Wifi,
    WifiOff,
    XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BankSettingsViewProps {
    bankId: string;
}

export const BankSettingsView = ({ bankId }: BankSettingsViewProps) => {
    const router = useRouter();
    const {
        data: bank,
        isLoading,
        error,
    } = useConnectedBankEndpoints.getById({
        param: { id: bankId },
    });

    // Settings state
    const [autoSync, setAutoSync] = useState(true);
    const [syncFrequency, setSyncFrequency] = useState('daily');
    const [notifications, setNotifications] = useState({
        newTransactions: true,
        balanceChanges: true,
        connectionIssues: true,
        weeklyReports: false,
    });
    const [isTestingConnection, setIsTestingConnection] = useState(false);

    const handleTestConnection = async () => {
        setIsTestingConnection(true);
        // Simulate API call
        setTimeout(() => {
            setIsTestingConnection(false);
        }, 2000);
    };

    const handleDisconnectBank = () => {
        // Handle bank disconnection
        console.log('Disconnecting bank...');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Bank Header Skeleton */}
                <Card className="animate-pulse">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-48" />
                                <div className="h-4 bg-gray-200 rounded w-32" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-5 bg-gray-200 rounded w-32" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !bank) {
        return (
            <Card className="p-6">
                <div className="text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank not found</h3>
                    <p className="text-gray-500 mb-4">
                        The requested bank could not be found or you don't have access to it.
                    </p>
                    <Button onClick={() => router.push('/banks')}>Back to Banks</Button>
                </div>
            </Card>
        );
    }

    const connectionStatus = bank.isActive ? 'connected' : 'disconnected';
    const lastSync = new Date(bank.updatedAt || bank.createdAt);

    return (
        <div className="space-y-6">
            {/* Bank Header */}
            <Card className="border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {bank.globalBank?.logo ? (
                                <div
                                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: bank.globalBank.color || '#f3f4f6' }}
                                >
                                    <img
                                        src={bank.globalBank.logo}
                                        alt={bank.globalBank.name}
                                        className="w-10 h-10 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Building2 className="h-8 w-8 text-gray-600" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {bank.globalBank?.name || 'Unknown Bank'} Settings
                                </h1>
                                <p className="text-gray-500">
                                    Manage connection settings and preferences
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                        variant="outline"
                                        className={
                                            connectionStatus === 'connected'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                        }
                                    >
                                        {connectionStatus === 'connected' ? (
                                            <Wifi className="h-3 w-3 mr-1" />
                                        ) : (
                                            <WifiOff className="h-3 w-3 mr-1" />
                                        )}
                                        {connectionStatus === 'connected'
                                            ? 'Connected'
                                            : 'Disconnected'}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        Last sync: {lastSync.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleTestConnection}
                                disabled={isTestingConnection}
                            >
                                {isTestingConnection ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                {isTestingConnection ? 'Testing...' : 'Test Connection'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Connection Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Connection Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">
                                    Auto-sync transactions
                                </Label>
                                <p className="text-sm text-gray-500">
                                    Automatically sync new transactions from your bank
                                </p>
                            </div>
                            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                        </div>

                        {autoSync && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Sync frequency</Label>
                                <select
                                    value={syncFrequency}
                                    onChange={(e) => setSyncFrequency(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="hourly">Every hour</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Connection timeout</Label>
                            <Input
                                type="number"
                                defaultValue="30"
                                className="w-full"
                                placeholder="Seconds"
                            />
                            <p className="text-xs text-gray-500">
                                How long to wait for bank responses (seconds)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">New transactions</Label>
                                <p className="text-sm text-gray-500">
                                    Get notified when new transactions are detected
                                </p>
                            </div>
                            <Switch
                                checked={notifications.newTransactions}
                                onCheckedChange={(checked) =>
                                    setNotifications((prev) => ({
                                        ...prev,
                                        newTransactions: checked,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Balance changes</Label>
                                <p className="text-sm text-gray-500">
                                    Alert when account balance changes significantly
                                </p>
                            </div>
                            <Switch
                                checked={notifications.balanceChanges}
                                onCheckedChange={(checked) =>
                                    setNotifications((prev) => ({
                                        ...prev,
                                        balanceChanges: checked,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Connection issues</Label>
                                <p className="text-sm text-gray-500">
                                    Notify when bank connection fails
                                </p>
                            </div>
                            <Switch
                                checked={notifications.connectionIssues}
                                onCheckedChange={(checked) =>
                                    setNotifications((prev) => ({
                                        ...prev,
                                        connectionIssues: checked,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium">Weekly reports</Label>
                                <p className="text-sm text-gray-500">
                                    Receive weekly spending summaries
                                </p>
                            </div>
                            <Switch
                                checked={notifications.weeklyReports}
                                onCheckedChange={(checked) =>
                                    setNotifications((prev) => ({
                                        ...prev,
                                        weeklyReports: checked,
                                    }))
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security & Privacy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">API Credentials Status</Label>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-600">
                                    Credentials are valid and encrypted
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Last credential update</Label>
                            <p className="text-sm text-gray-500">
                                {new Date(bank.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <Button variant="outline" size="sm" className="w-full">
                            <Key className="h-4 w-4 mr-2" />
                            Update Credentials
                        </Button>

                        <div className="pt-4 border-t">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Data retention</Label>
                                <p className="text-sm text-gray-500">
                                    Transaction data is kept for 7 years as required by law
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Data Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Export data</Label>
                            <p className="text-sm text-gray-500">
                                Download your transaction data in various formats
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    CSV
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    JSON
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Import historical data</Label>
                            <p className="text-sm text-gray-500">
                                Upload CSV files with historical transactions
                            </p>
                            <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload CSV
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Sync history</Label>
                            <p className="text-sm text-gray-500">
                                Last successful sync: {lastSync.toLocaleString()}
                            </p>
                            <Button variant="outline" size="sm">
                                <Clock className="h-4 w-4 mr-2" />
                                View Sync Log
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Advanced Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Custom bank name</Label>
                            <Input
                                defaultValue={bank.globalBank?.name || ''}
                                placeholder="Enter custom name"
                            />
                            <p className="text-xs text-gray-500">
                                Override the default bank name for your records
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Notes</Label>
                            <Textarea
                                placeholder="Add notes about this bank connection..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">Debug mode</Label>
                            <p className="text-sm text-gray-500">
                                Enable detailed logging for troubleshooting
                            </p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium text-red-600">
                                Disconnect bank
                            </Label>
                            <p className="text-sm text-gray-500">
                                This will remove the bank connection and stop syncing transactions.
                                Historical data will be preserved.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Disconnect
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Disconnect Bank</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to disconnect {bank.globalBank?.name}?
                                        This will stop syncing new transactions, but your historical
                                        data will be preserved. You can reconnect at any time.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDisconnectBank}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Disconnect Bank
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium text-red-600">
                                Delete all data
                            </Label>
                            <p className="text-sm text-gray-500">
                                Permanently delete all transactions and data for this bank. This
                                action cannot be undone.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete All Data</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete all transactions, accounts, and
                                        data associated with {bank.globalBank?.name}. This action
                                        cannot be undone. Are you absolutely sure?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                        Delete All Data
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
