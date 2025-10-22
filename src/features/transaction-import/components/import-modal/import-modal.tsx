'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { useImportModal } from '@/features/transaction-import/hooks';
import { Banknote, CheckCircle2, Upload, Zap } from 'lucide-react';

import { AccountSelectionStep } from './account-selection-step';
import { ProcessingAndPreviewStep } from './processing-preview-step';
import { SuccessStep } from './success-step';
import { UploadStep } from './upload-step';

interface ImportModalProps {
    onSuccess?: () => void;
}

const STEP_CONFIG = {
    accountSelection: {
        title: 'Select Account',
        description: 'Select the account you want to import transactions into',
        icon: Banknote,
        progress: 0,
    },
    upload: {
        title: 'Import Transactions',
        description: 'Upload your CSV file to get started',
        icon: Upload,
        progress: 0,
    },
    processing: {
        title: 'Processing File',
        description: 'Analyzing and validating your data',
        icon: Zap,
        progress: 50,
    },
    success: {
        title: 'Import Complete',
        description: 'Your transactions are ready',
        icon: CheckCircle2,
        progress: 100,
    },
} as const;

export const ImportModal: React.FC<ImportModalProps> = ({ onSuccess }) => {
    const { modalOpen, setModalOpen, currentStep, reset } = useImportModal();

    const stepConfig = STEP_CONFIG[currentStep];
    const StepIcon = stepConfig.icon;

    const handleClose = () => {
        reset();
        onSuccess?.();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            reset();
        }
        setModalOpen(open);
    };

    // Simple View component for conditional rendering
    const View = ({ name, children }: { name: string; children: React.ReactNode }) => {
        if (currentStep !== name) return null;
        return <>{children}</>;
    };

    return (
        <ResponsiveModal size="auto" open={modalOpen} onOpenChange={handleOpenChange}>
            <View name="accountSelection">
                <ResponsiveModal.Content>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 transition-all duration-300 ease-in-out">
                        <AccountSelectionStep />
                    </div>
                </ResponsiveModal.Content>
            </View>

            <View name="upload">
                <ResponsiveModal.Content>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 transition-all duration-300 ease-in-out">
                        <UploadStep />
                    </div>
                </ResponsiveModal.Content>
            </View>

            <View name="processing">
                <ResponsiveModal.Content>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 transition-all duration-300 ease-in-out">
                        <ProcessingAndPreviewStep />
                    </div>
                </ResponsiveModal.Content>
            </View>

            <View name="success">
                <ResponsiveModal.Content>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 transition-all duration-300 ease-in-out">
                        <SuccessStep onContinue={handleClose} />
                    </div>
                </ResponsiveModal.Content>
            </View>
        </ResponsiveModal>
    );
};
