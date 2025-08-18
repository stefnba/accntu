'use client';

import { LabelBadge } from '@/features/label/components/label-badge';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLabelSelectorModal } from '@/features/label/hooks';
import { TagBadge } from '@/features/tag/components/tag-badge';
import { useTagSelectorModal } from '@/features/tag/hooks';
import { useTransactionEndpoints } from '@/features/transaction/api';
import {
    TRANSACTION_TYPE_OPTIONS,
    TransactionTypeBadge,
    TTransactionType,
} from '@/features/transaction/components/type';
import { useState } from 'react';
import type { TTransaction } from './table-columns';

interface TagEditCellProps {
    transaction: TTransaction;
}

export const TagEditCell = ({ transaction }: TagEditCellProps) => {
    const { open } = useTagSelectorModal();

    const currentTags = transaction.tags;

    return (
        <div
            className="cursor-pointer hover:bg-muted/30 p-1 rounded min-h-[24px] flex items-center gap-1"
            onClick={() =>
                open({ transactionId: transaction.id, tagsIds: currentTags?.map((tag) => tag.id) })
            }
        >
            {currentTags?.length ? (
                currentTags?.map((tag) => <TagBadge size="sm" key={tag.id} tag={tag} />)
            ) : (
                <span className="text-muted-foreground italic">Click to select</span>
            )}
        </div>
    );
};

interface LabelEditCellProps {
    transaction: TTransaction;
}

export const LabelEditCell = ({ transaction }: LabelEditCellProps) => {
    const { openModal } = useLabelSelectorModal();

    const currentLabel = transaction.label;

    return (
        <>
            <div
                className="cursor-pointer hover:bg-muted/30 p-1 rounded min-h-[24px] flex items-center"
                onClick={() =>
                    openModal({ transactionId: transaction.id, labelId: currentLabel?.id })
                }
                title="Click to select label"
            >
                {currentLabel ? (
                    <LabelBadge size="sm" variant="default" label={currentLabel} />
                ) : (
                    <span className="text-muted-foreground italic">Click to select</span>
                )}
            </div>
        </>
    );
};

interface TypeEditCellProps {
    transaction: TTransaction;
}

export const TypeEditCell = ({ transaction }: TypeEditCellProps) => {
    const type = transaction.type;

    // =========================
    // API calls
    // =========================
    const updateTransaction = useTransactionEndpoints.update();

    // =========================
    // Hooks
    // =========================
    const [isEditing, setIsEditing] = useState(false);

    // =========================
    // Handlers
    // =========================

    const handleValueChange = (newValue: TTransactionType) => {
        if (newValue === String(transaction.type)) {
            setIsEditing(false);
            return;
        }

        updateTransaction.mutate({
            param: { id: transaction.id },
            json: { type: newValue },
        });
    };

    // =========================
    // Render
    // =========================

    const renderType = () => {
        return (
            <div
                className="cursor-pointer hover:bg-muted/30 p-1 rounded min-h-[24px] flex items-center"
                onClick={() => setIsEditing(true)}
                title="Click to select type"
            >
                <TransactionTypeBadge type={transaction.type} />
            </div>
        );
    };

    if (!isEditing) {
        return renderType();
    }

    return (
        <Select
            defaultValue={String(transaction.type || 'none')}
            onValueChange={handleValueChange}
            onOpenChange={setIsEditing}
        >
            <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
                {TRANSACTION_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                        {option.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
