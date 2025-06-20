import { useConnectedBankEndpoints } from '@/features/bank/api';
import { useTransactionImportEndpoints } from '@/features/transaction-import/api';
import { useImportModal } from '@/features/transaction-import/hooks';
import { useState } from 'react';

export const UploadStep = () => {
    const {
        setCurrentStep,
        setImportId,
        setFileName,
        connectedBankAccountId,
        setConnectedBankAccountId,
    } = useImportModal();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { data: banksData } = useConnectedBankEndpoints.getAll({});
    const { mutate: createImport } = useTransactionImportEndpoints.create({
        onSuccess: (data) => {
            setImportId(data.transactionImport.id);
            setCurrentStep('processing');
        },
        errorHandlers: {
            default({ error }) {
                alert(error.message);
                setIsUploading(false);
            },
        },
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
                alert('Please select a CSV file');
                return;
            }
            setSelectedFile(file);
            setFileName(file.name);
        }
    };

    const handleUpload = async () => {
        alert('Upload');
    };

    return <div className="space-y-8 py-8">Upload</div>;
};
