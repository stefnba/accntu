import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { LabelUpsertForm } from '@/features/label/components/label-upsert/form';
import { LabelUpsertIcon } from '@/features/label/components/label-upsert/icon';
import { LabelUpsertParent } from '@/features/label/components/label-upsert/parent';
import { useLabelUpsertModal } from '@/features/label/hooks';

export const LabelUpsertModal = () => {
    // ================================
    // Hooks
    // ================================
    const { isModalOpen, closeModal, labelId, view } = useLabelUpsertModal();

    const isEditMode = Boolean(labelId);

    return (
        <ResponsiveModal
            title={isEditMode ? 'Edit Label' : 'Create New Label'}
            open={isModalOpen}
            onOpenChange={closeModal}
            size="lg"
        >
            {view === 'parent' && <LabelUpsertParent />}
            {view === 'icon' && <LabelUpsertIcon />}
            {view === 'form' && <LabelUpsertForm />}
        </ResponsiveModal>
    );
};
