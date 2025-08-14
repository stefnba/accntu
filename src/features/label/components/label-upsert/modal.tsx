import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { LabelUpsertForm } from '@/features/label/components/label-upsert/form';
import { useLabelUpsertModal } from '@/features/label/hooks';

export const LabelUpsertModal = () => {
    // ================================
    // Hooks
    // ================================
    const { isModalOpen, closeModal, labelId } = useLabelUpsertModal();

    console.log('isOpen', isModalOpen);

    const isEditMode = Boolean(labelId);

    return (
        <ResponsiveModal
            title={isEditMode ? 'Edit Label' : 'Create New Label'}
            open={isModalOpen}
            onOpenChange={closeModal}
            size="lg"
        >
            <LabelUpsertForm />
        </ResponsiveModal>
    );
};
