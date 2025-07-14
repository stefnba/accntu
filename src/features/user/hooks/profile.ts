import { useQueryStateModal, useStepModal } from '@/hooks';

export const useProfileUpdateModal = ({ onClose }: { onClose?: () => void } = {}) => {
    const modal = useQueryStateModal({
        views: ['name', 'email', 'picture'] as const,
        onClose() {
            pictureStep.resetStep();
            onClose?.();
        },
    });

    const pictureStep = useStepModal({
        steps: ['select', 'edit', 'uploading', 'complete'] as const,
        initialStep: 'select',
    });

    return {
        ...modal,
        ...pictureStep,
    };
};
