'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
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
    const { data: globalBanksData, isLoading: banksLoading } = useGlobalBankEndpoints.getAll({
        query: { pageSize: '100' },
    });

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

    // Get View component from modal if available
    const View =
        currentStep === 'intro' ||
        currentStep === 'country' ||
        currentStep === 'bank-selection' ||
        currentStep === 'account-selection' ||
        currentStep === 'loading' ||
        currentStep === 'success'
            ? ({ name, children }: { name: string; children: React.ReactNode }) => {
                  if (currentStep !== name) return null;
                  return <>{children}</>;
              }
            : null;

    if (!View) return null;

    return (
        <ResponsiveModal open={modalOpen} onOpenChange={setModalOpen}>
            <View name="intro">
                <ResponsiveModal.Header>
                    <ResponsiveModal.Title>Connect Bank Account</ResponsiveModal.Title>
                </ResponsiveModal.Header>
                <ResponsiveModal.Content>
                    <div className="min-h-[400px]">
                        <IntroStep />
                    </div>
                </ResponsiveModal.Content>
            </View>

            <View name="country">
                <ResponsiveModal.Content>
                    <div className="min-h-[400px]">
                        <CountryStep />
                    </div>
                </ResponsiveModal.Content>
            </View>

            <View name="bank-selection">
                <ResponsiveModal.Content>
                    <div className="min-h-[400px]">
                        <BankSelectionStep />
                    </div>
                </ResponsiveModal.Content>
            </View>

            <View name="account-selection">
                <ResponsiveModal.Content>
                    <div className="min-h-[400px]">
                        {selectedBankId && (
                            <AccountSelectionStep onContinue={handleCreateAccounts} />
                        )}
                    </div>
                </ResponsiveModal.Content>
            </View>

            <View name="loading">
                <ResponsiveModal.Content>
                    <div className="min-h-[400px]">
                        <LoadingStep message="Creating your bank accounts..." />
                    </div>
                </ResponsiveModal.Content>
            </View>

            <View name="success">
                <ResponsiveModal.Content>
                    <div className="min-h-[400px]">
                        <SuccessStep
                            onContinue={handleClose}
                            accountCount={selectedAccountIds.length}
                        />
                    </div>
                </ResponsiveModal.Content>
            </View>
        </ResponsiveModal>
    );
};
