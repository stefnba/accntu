'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { LabelSelectorForTransaction } from '@/features/label/components/label-selector/transaction';
import { useLabelSelectorModal } from '@/features/label/hooks';

interface LabelSelectorModalProps {
    className?: string;
}

export const LabelSelectorModal: React.FC<LabelSelectorModalProps> = ({ className }) => {
    const { isOpen, setOpen } = useLabelSelectorModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setOpen} className={className} size="lg">
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>Select Label</ResponsiveModal.Title>
                <ResponsiveModal.Description>
                    Choose a label to categorize this transaction
                </ResponsiveModal.Description>
            </ResponsiveModal.Header>
            <ResponsiveModal.Content>
                <LabelSelectorForTransaction />
            </ResponsiveModal.Content>
        </ResponsiveModal>
    );
};
