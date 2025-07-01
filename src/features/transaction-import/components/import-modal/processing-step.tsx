'use client';

import { Progress } from '@/components/ui/progress';
import { useImportFileEndpoints } from '@/features/transaction-import/api';
import { useImportModal } from '@/features/transaction-import/hooks';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ProcessingStep: React.FC = () => {
    const { activeFileId, setCurrentStep } = useImportModal();
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('Preparing to process file...');

    const { mutateAsync: parseTransactions } = useImportFileEndpoints.parse();

    useEffect(() => {
        if (!activeFileId) return;

        const processFile = async () => {
            try {
                setProgress(10);
                setStatusMessage('Reading file from S3...');

                // Simulate reading progress
                setTimeout(() => {
                    setProgress(30);
                    setStatusMessage('Parsing CSV/Excel data...');
                }, 500);

                setTimeout(() => {
                    setProgress(60);
                    setStatusMessage('Validating transactions...');
                }, 1000);

                // Actually parse the transactions
                await parseTransactions({ param: { id: activeFileId } });

                setProgress(90);
                setStatusMessage('Checking for duplicates...');

                setTimeout(() => {
                    setProgress(100);
                    setStatusMessage('Processing complete!');

                    // Move to preview step after short delay
                    setTimeout(() => {
                        setCurrentStep('preview');
                    }, 800);
                }, 500);
            } catch (error) {
                setStatusMessage('Error processing file. Please try again.');
                console.error('Processing error:', error);
            }
        };

        processFile();
    }, [activeFileId, parseTransactions, setCurrentStep]);

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                    {progress < 100 ? (
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    ) : (
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    )}
                </div>

                <h3 className="text-lg font-semibold">Processing File</h3>
                <p className="text-sm text-muted-foreground">
                    Analyzing and validating your transaction data
                </p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                </div>

                <Progress value={progress} className="h-2" />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{statusMessage}</span>
                </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">What's happening?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Reading your uploaded file from secure storage</li>
                    <li>• Parsing CSV/Excel data and extracting transactions</li>
                    <li>• Validating transaction format and data quality</li>
                    <li>• Checking for duplicate transactions in your account</li>
                </ul>
            </div>
        </div>
    );
};
