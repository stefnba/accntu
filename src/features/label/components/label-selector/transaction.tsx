'use client';

import { toast } from '@/components/feedback';
import { LabelSelectorContent } from '@/features/label/components/label-selector/content';

import { useLabelSelectorModal } from '@/features/label/hooks';
import { useTransactionEndpoints } from '@/features/transaction/api';

interface LabelSelectorForTransactionProps {
    className?: string;
}

export const LabelSelectorForTransaction: React.FC<LabelSelectorForTransactionProps> = ({
    className,
}) => {
    // =========================
    // Hooks & State
    // =========================

    const { transactionId, labelId, closeModal } = useLabelSelectorModal();

    // =========================
    // API calls
    // =========================
    const updateTransactionMutation = useTransactionEndpoints.update();
    const { data: transaction } = useTransactionEndpoints.getById(
        {
            param: {
                id: transactionId!,
            },
        },
        {
            enabled: !!transactionId && !labelId,
        }
    );

    // =========================
    // Handlers
    // =========================

    if (!transactionId) {
        return <div>No transaction selected</div>;
    }

    const handleSelect = (labelId: string | null) => {
        updateTransactionMutation.mutate(
            {
                param: {
                    id: transactionId,
                },
                json: {
                    labelId,
                },
            },
            {
                onSuccess: () => {
                    closeModal();
                    toast.success('Label selected successfully');
                },
            }
        );
    };

    return (
        <LabelSelectorContent
            className={className}
            onSelect={handleSelect}
            currentLabelId={labelId || transaction?.labelId}
        />
    );
};
