import { parseAsArrayOf, parseAsBoolean, parseAsString, useQueryState } from 'nuqs';

type Step = 'intro' | 'country' | 'bank-selection' | 'account-selection' | 'loading' | 'success';

/**
 * Hook to manage the add bank modal state
 *
 */
export const useAddBankModal = () => {
    const [modalOpen, setModalOpen] = useQueryState('addBank', parseAsBoolean.withDefault(false));
    const [currentStep, setCurrentStep] = useQueryState('step', parseAsString.withDefault('intro'));

    // Form state - only store IDs, not entire objects
    const [selectedCountry, setSelectedCountry] = useQueryState(
        'country',
        parseAsString.withDefault('')
    );
    const [selectedBankId, setSelectedBankId] = useQueryState(
        'bankId',
        parseAsString.withDefault('')
    );
    const [searchQuery, setSearchQuery] = useQueryState('search', parseAsString.withDefault(''));
    const [selectedAccountIds, setSelectedAccountIds] = useQueryState(
        'accountIds',
        parseAsArrayOf(parseAsString).withDefault([])
    );

    const openModal = () => {
        setModalOpen(true);
        setCurrentStep('intro');
        resetFormState();
    };

    const closeModal = () => {
        setModalOpen(false);
        resetFormState();
        setCurrentStep('intro', {
            clearOnDefault: true,
        }); // Reset to intro step when closing
    };

    const resetModal = () => {
        setCurrentStep('intro');
        resetFormState();
    };

    // Reset all form state
    const resetFormState = () => {
        setSelectedCountry('', { clearOnDefault: true });
        setSelectedBankId('', { clearOnDefault: true });
        setSearchQuery('', { clearOnDefault: true });
        setSelectedAccountIds([], { clearOnDefault: true });
    };

    // Handle country selection
    const handleSelectCountry = (countryCode: string) => {
        setSelectedCountry(countryCode);
        setCurrentStep('bank-selection');
    };

    // Handle bank selection - only store the bank ID
    const handleSelectBank = (bankId: string) => {
        setSelectedBankId(bankId);
        setCurrentStep('account-selection');
    };

    // Handle account ID toggle
    const handleAccountToggle = (accountId: string) => {
        setSelectedAccountIds((prev) =>
            prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
        );
    };

    return {
        // Modal state
        modalOpen,
        setModalOpen,
        openModal,
        closeModal,
        resetModal,

        // Steps
        currentStep,
        setCurrentStep,

        // Form state
        selectedCountry,
        setSelectedCountry,
        selectedBankId,
        setSelectedBankId,
        searchQuery,
        setSearchQuery,
        selectedAccountIds,
        setSelectedAccountIds,

        // Form actions
        resetFormState,
        handleSelectCountry,
        handleSelectBank,
        handleAccountToggle,
    };
};
