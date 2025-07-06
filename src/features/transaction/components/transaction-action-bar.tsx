'use client';

import { Button } from '@/components/ui/button';
import { useColumnManagement } from '@/features/transaction/hooks';
import { IconLayoutColumns, IconPlus } from '@tabler/icons-react';

export const TransactionActionBar = () => {
    const { open } = useColumnManagement();

    return (
        <div className="flex items-center justify-between">
            <Button variant="outline">
                <IconPlus className="h-4 w-4 mr-2" />
                Add Transaction
            </Button>
            <Button variant="outline" onClick={() => open()}>
                <IconLayoutColumns className="h-4 w-4 mr-2" />
                Manage Columns
            </Button>
        </div>
    );
};
