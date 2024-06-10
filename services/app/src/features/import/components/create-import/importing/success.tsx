import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { storeCreateImportModal } from '@/features/import/store/create-import-modal';

interface Props {
    transactionCount: number;
}

export const ImportSuccess = ({ transactionCount }: Props) => {
    const router = useRouter();
    const { handleClose } = storeCreateImportModal();

    const handleClick = () => {
        router.push('/transaction');
        handleClose();
    };

    return (
        <div className="text-center">
            <h1>Import Success</h1>
            <p className="mt-8">
                {transactionCount} transactions have been imported
            </p>

            <Button onClick={handleClick}>View Transactions</Button>
        </div>
    );
};
