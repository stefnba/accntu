'use client';

import { ResponsiveModal } from '@/components/responsive-modal';
import { Button } from '@/components/ui/button';
import { TagSelectorContent } from '@/features/tag/components/tag-selector/content';
import { useTagSelectorModal } from '@/features/tag/hooks';

interface TagSelectorModalProps {
    className?: string;
}

export const TagSelectorModal: React.FC<TagSelectorModalProps> = ({ className }) => {
    const { isOpen, setOpen } = useTagSelectorModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setOpen} className={className} size="lg">
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>Select Tags</ResponsiveModal.Title>
                <ResponsiveModal.Description>
                    Choose tags to add additional context to this transaction
                </ResponsiveModal.Description>
            </ResponsiveModal.Header>
            <ResponsiveModal.Content>
                <TagSelectorContent />
            </ResponsiveModal.Content>
            <ResponsiveModal.Footer>
                <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button onClick={() => setOpen(true)}>Save</Button>
            </ResponsiveModal.Footer>
        </ResponsiveModal>
    );
};
