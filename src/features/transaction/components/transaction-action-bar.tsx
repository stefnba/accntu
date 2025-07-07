'use client';

import { Button } from '@/components/ui/button';
import { useColumnManagementModal } from '@/features/transaction/hooks';
import { IconLayoutColumns } from '@tabler/icons-react';

export const TransactionActionBar = () => {
    const { open } = useColumnManagementModal();

    return (
        <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => open()}>
                <IconLayoutColumns className="h-4 w-4 mr-2" />
                Columns
            </Button>
        </div>
    );
};
