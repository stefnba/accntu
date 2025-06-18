'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BankDetailsSettingsProps {
    bank: any;
}

export const BankDetailsSettings = ({ bank }: BankDetailsSettingsProps) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border-gray-200">
                    <CardHeader>
                        <CardTitle>Bank Connection Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Auto-sync transactions</h4>
                                <p className="text-sm text-gray-500">
                                    Automatically sync new transactions daily
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                Enable
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Connection status</h4>
                                <p className="text-sm text-gray-500">
                                    Last synced:{' '}
                                    {new Date(bank.updatedAt || bank.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                Connected
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Button variant="destructive" size="sm">
                                Disconnect Bank
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                    <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Transaction alerts</h4>
                                <p className="text-sm text-gray-500">
                                    Get notified of new transactions
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                Configure
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Low balance alerts</h4>
                                <p className="text-sm text-gray-500">Alert when balance is low</p>
                            </div>
                            <Button variant="outline" size="sm">
                                Set Threshold
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Weekly summaries</h4>
                                <p className="text-sm text-gray-500">
                                    Receive weekly spending summaries
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                Enable
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
