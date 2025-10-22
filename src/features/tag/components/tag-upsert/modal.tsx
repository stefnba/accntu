import { ResponsiveModal } from '@/components/responsive-modal';
import { TagUpsertForm } from '@/features/tag/components/tag-upsert/form';

import { useTagUpsertModal } from '@/features/tag/hooks';

export const TagUpsertModal = () => {
    const { modal } = useTagUpsertModal();

    return (
        <ResponsiveModal open={modal.isOpen} onOpenChange={modal.close} size="lg">
            {/* Create view */}
            <modal.View name="create">
                <ResponsiveModal.Header>
                    <ResponsiveModal.Title>Create New Tag</ResponsiveModal.Title>
                </ResponsiveModal.Header>
                <ResponsiveModal.Content>
                    <TagUpsertForm />
                </ResponsiveModal.Content>
            </modal.View>

            {/* Update view */}
            <modal.View name="update">
                <ResponsiveModal.Header>
                    <ResponsiveModal.Title>Update Tag</ResponsiveModal.Title>
                </ResponsiveModal.Header>
                <ResponsiveModal.Content>
                    <TagUpsertForm />
                </ResponsiveModal.Content>
            </modal.View>
        </ResponsiveModal>
    );
};
