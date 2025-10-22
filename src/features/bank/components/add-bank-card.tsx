'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAddBankModal } from '@/features/bank/hooks';
import { Plus } from 'lucide-react';

export const AddBankCard = () => {
    const { openModal } = useAddBankModal();

    return (
        <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <Plus className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Add New Bank</h3>
                        <p className="text-sm text-gray-500">
                            Connect another bank account to manage all your finances in one place
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="group-hover:bg-gray-50"
                        onClick={() => openModal()}
                    >
                        Connect Bank
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
