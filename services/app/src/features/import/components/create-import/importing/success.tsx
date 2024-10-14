import { useRouter } from 'next/navigation';

import { Icons } from '@/components';
import { Button } from '@/components/ui/button';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';
import { storeImportTransactions } from '@/features/import/store/import-transactions';

interface Props {}

export const ImportSuccess = () => {
    const router = useRouter();
    const { handleClose } = storeCreateImportModal();

    const { count: transactionCount } = storeImportTransactions();

    const handleClick = () => {
        router.push('/transaction');
        handleClose();
    };

    return (
        <div className="text-center">
            <div className="w-full text-center text-[60px] text-green-400">
                <Icons.Success className="mx-auto" />
            </div>

            <div className="text-2xl font-semibold mt-4">Import Successful</div>
            <div className="text-muted-foreground">
                {transactionCount} transactions have been imported
            </div>

            <Button className="mt-4" variant="outline" onClick={handleClick}>
                View Transactions
            </Button>
        </div>
    );
};
