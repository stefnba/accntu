'use client';

import { ResponsiveModal } from '@/components/ui/responsive-modal';
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

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'accountSelection':
                return <AccountSelectionStep />;
            case 'upload':
                return <UploadStep />;
            case 'processing':
                return <ProcessingAndPreviewStep />;
            case 'success':
                return <SuccessStep onContinue={handleClose} />;
            default:
                return;
        }
    };

    return (
        <ResponsiveModal size="auto" open={modalOpen} onOpenChange={handleOpenChange}>
            {/* Content with better spacing and transitions */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 ">
                <div className="transition-all duration-300 ease-in-out">{renderCurrentStep()}</div>
            </div>
        </ResponsiveModal>
    );
};
