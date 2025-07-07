'use client';

import { LabelBadge } from '@/features/label/components/label-badge';

import { useLabelSelectorModal } from '@/features/label/hooks';
import type { TTransaction } from './table-columns';

interface EditableLabelCellProps {
    transaction: TTransaction;
}

export const EditableLabelCell = ({ transaction }: EditableLabelCellProps) => {
    const { open } = useLabelSelectorModal();

    const currentLabel = transaction.label;

    return (
        <>
            <div
                className="cursor-pointer hover:bg-muted/30 p-1 rounded min-h-[24px] flex items-center"
                onClick={() => open({ transactionId: transaction.id, labelId: currentLabel?.id })}
                title="Click to select label"
            >
                {currentLabel ? (
                    <LabelBadge label={currentLabel} />
                ) : (
                    <span className="text-muted-foreground italic">Click to select</span>
                )}
            </div>
        </>
    );
};
