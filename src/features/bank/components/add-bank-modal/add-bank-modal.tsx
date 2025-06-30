'use client';

import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { useConnectedBankEndpoints, useGlobalBankEndpoints } from '@/features/bank/api';
import { useAddBankModal } from '@/features/bank/hooks';
import { AccountSelectionStep } from './account-selection-step';
import { BankSelectionStep } from './bank-selection-step';
import { CountryStep } from './country-step';
import { IntroStep } from './intro-step';
import { LoadingStep } from './loading-step';
import { SuccessStep } from './success-step';

interface AddBankModalProps {
    onSuccess?: () => void;
}

export const AddBankModal = ({ onSuccess }: AddBankModalProps) => {
    // Modal and form state management
    const {
        modalOpen,
        setModalOpen,
        currentStep,
        setCurrentStep,
        closeModal,
        selectedBankId,
        selectedAccountIds,
    } = useAddBankModal();

    // API hooks
    const { data: globalBanksData, isLoading: banksLoading } = useGlobalBankEndpoints.getAll({});

    const { mutate: createConnectedBank } = useConnectedBankEndpoints.create({
        errorHandlers: {
            default({ error }) {
                alert(error.message);
            },
        },
        onSuccess: () => {
            setCurrentStep('success');
        },
    });

    // Handle modal close
    const handleClose = () => {
        closeModal();
        onSuccess?.();
    };

    // Handle account creation process
    const handleCreateAccounts = async () => {
        if (!selectedBankId || selectedAccountIds.length === 0) return;

        console.log('selectedBankId', selectedBankId);
        console.log('selectedAccountIds', selectedAccountIds);

        createConnectedBank({
            json: {
                globalBankId: selectedBankId,
                connectedBankAccounts: selectedAccountIds.map((accountId) => ({
                    globalBankAccountId: accountId,
                })),
            },
        });
    };

    // Render current step
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'intro':
                return <IntroStep />;

            case 'country':
                return <CountryStep />;

            case 'bank-selection':
                return <BankSelectionStep />;

            case 'account-selection':
                return selectedBankId ? (
                    <AccountSelectionStep onContinue={handleCreateAccounts} />
                ) : null;

            case 'loading':
                return <LoadingStep message="Creating your bank accounts..." />;

            case 'success':
                return (
                    <SuccessStep
                        onContinue={handleClose}
                        accountCount={selectedAccountIds.length}
                    />
                );

            default:
                return <IntroStep />;
        }
    };

    return (
        <ResponsiveModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title={currentStep === 'intro' ? 'Connect Bank Account' : undefined}
        >
            <div className="min-h-[400px]">{renderCurrentStep()}</div>
        </ResponsiveModal>
    );
};
