'use client';

import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { TagSelectorContent } from '@/features/tag/components/tag-selector/content';
import { useTagSelectorModal } from '@/features/tag/hooks';

interface TagSelectorModalProps {
    className?: string;
}

export const TagSelectorModal: React.FC<TagSelectorModalProps> = ({ className }) => {
    const { isOpen, setOpen } = useTagSelectorModal();

    return (
        <ResponsiveModal
            open={isOpen}
            onOpenChange={setOpen}
            title="Select Tags"
            description="Choose tags to add additional context to this transaction"
            className={className}
            size="lg"
        >
            <TagSelectorContent />
        </ResponsiveModal>
    );
};
