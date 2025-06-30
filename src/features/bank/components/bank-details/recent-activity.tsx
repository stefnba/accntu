'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';

interface BankDetailsRecentActivityProps {
    bank: any;
}

export const BankDetailsRecentActivity = ({ bank }: BankDetailsRecentActivityProps) => {
    return (
        <div className="space-y-6">
            <Card className="bg-white border-gray-200">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Recent Activity</CardTitle>
                            <p className="text-gray-500 mt-1">
                                Latest transactions across all accounts
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            View All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ArrowUpRight className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No transactions yet
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Once you connect accounts and sync data, your transactions will appear
                            here
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
