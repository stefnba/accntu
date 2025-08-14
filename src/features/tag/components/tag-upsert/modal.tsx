import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { TagUpsertForm } from '@/features/tag/components/tag-upsert/form';

import { useTagUpsertModal } from '@/features/tag/hooks';

export const TagUpsertModal = () => {
    // ================================
    // Hooks
    // ================================
    const { isModalOpen, closeModal, tagId } = useTagUpsertModal();

    const isEditMode = Boolean(tagId);

    return (
        <ResponsiveModal
            title={isEditMode ? 'Edit Tag' : 'Create New Tag'}
            open={isModalOpen}
            onOpenChange={closeModal}
            size="lg"
        >
            <TagUpsertForm />
        </ResponsiveModal>
    );
};
