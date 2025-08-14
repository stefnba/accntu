'use client';

import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { LabelSelectorContent } from '@/features/label/components/label-selector/content';
import { useLabelSelectorModal } from '@/features/label/hooks';

interface LabelSelectorModalProps {
    className?: string;
}

export const LabelSelectorModal: React.FC<LabelSelectorModalProps> = ({ className }) => {
    const { isOpen, setOpen } = useLabelSelectorModal();

    return (
        <ResponsiveModal
            open={isOpen}
            onOpenChange={setOpen}
            title="Select Label"
            description="Choose a label to categorize this transaction"
            className={className}
            size="lg"
        >
            <LabelSelectorContent />
        </ResponsiveModal>
    );
};
