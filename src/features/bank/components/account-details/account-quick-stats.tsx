'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

export const AccountQuickStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monthly Income</p>
                            <p className="text-xl font-bold text-green-600">+€2,500</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monthly Expenses</p>
                            <p className="text-xl font-bold text-red-600">-€1,865</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50">
                            <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Transactions</p>
                            <p className="text-xl font-bold text-gray-900">47</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg. Transaction</p>
                            <p className="text-xl font-bold text-gray-900">€89</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
