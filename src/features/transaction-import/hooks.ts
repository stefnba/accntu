import { parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

export type ImportStep = 'accountSelection' | 'upload' | 'processing' | 'preview' | 'success';

const IMPORT_STEPS = ['accountSelection', 'upload', 'processing', 'preview', 'success'] as const;

/**
 * Hook to manage the import modal state
 */
export const useImportModal = () => {
    const defaultStep: ImportStep = 'accountSelection';

    const [modalOpen, setModalOpen] = useQueryState(
        'importModal',
        parseAsBoolean.withDefault(false)
    );

    const [currentStep, setCurrentStep] = useQueryState(
        'importStep',
        parseAsStringLiteral(IMPORT_STEPS).withDefault(defaultStep)
    );

    const [importId, setImportId] = useQueryState('importId', parseAsString.withDefault(''));

    const [fileName, setFileName] = useQueryState('fileName', parseAsString.withDefault(''));

    const [connectedBankAccountId, setConnectedBankAccountId] = useQueryState(
        'importAccountId',
        parseAsString.withDefault('')
    );

    // Note: parsedTransactions is complex data that shouldn't be stored in URL
    // We'll handle this separately, possibly with a separate state management solution
    // or by fetching it based on importId when needed

    const openModal = (accountId?: string) => {
        setModalOpen(true);
        setCurrentStep(accountId ? 'upload' : defaultStep);
        console.log('accountId', accountId);

        // Reset only the form fields that should be cleared when opening
        setImportId('', { clearOnDefault: true });
        setFileName('', { clearOnDefault: true });

        // Set the account ID if provided, otherwise clear it
        if (accountId) {
            setConnectedBankAccountId(accountId);
        } else {
            setConnectedBankAccountId('', { clearOnDefault: true });
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        resetFormState();
    };

    const resetFormState = () => {
        setImportId('', { clearOnDefault: true });
        setFileName('', { clearOnDefault: true });
        setConnectedBankAccountId('', { clearOnDefault: true });
        setCurrentStep(defaultStep, { clearOnDefault: true });
    };

    const reset = () => {
        setModalOpen(false);
        resetFormState();
    };

    return {
        // Modal state
        modalOpen,
        setModalOpen,
        openModal,
        closeModal,

        // Steps
        currentStep,
        setCurrentStep,

        // Form state
        importId: importId || null,
        setImportId: (id: string | null) => setImportId(id || '', { clearOnDefault: !id }),
        fileName: fileName || null,
        setFileName: (name: string | null) => setFileName(name || '', { clearOnDefault: !name }),
        connectedBankAccountId: connectedBankAccountId || null,
        setConnectedBankAccountId: (id: string | null) =>
            setConnectedBankAccountId(id || '', { clearOnDefault: !id }),

        // Actions
        reset,
        resetFormState,
    };
};
