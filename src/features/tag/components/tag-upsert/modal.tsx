import { ResponsiveModal } from '@/components/responsive-modal';
import { TagUpsertForm } from '@/features/tag/components/tag-upsert/form';

import { useTagUpsertModal } from '@/features/tag/hooks';

export const TagUpsertModal = () => {
    const { isModalOpen, closeModal, tagId } = useTagUpsertModal();

    const isEditMode = Boolean(tagId);

    return (
        <ResponsiveModal open={isModalOpen} onOpenChange={closeModal} size="lg">
            <ResponsiveModal.Header>
                <ResponsiveModal.Title>
                    {isEditMode ? 'Edit Tag' : 'Create New Tag'}
                </ResponsiveModal.Title>
            </ResponsiveModal.Header>
            <ResponsiveModal.Content>
                <TagUpsertForm />
            </ResponsiveModal.Content>
        </ResponsiveModal>
    );
};
