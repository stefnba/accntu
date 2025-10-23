import { useResponsiveModal } from '@/components/responsive-modal';
import { parseAsString, useQueryState } from 'nuqs';

/**
 * Hook to manage the add/update participant modal state
 */
export const useUpsertParticipantModal = ({ onOpen }: { onOpen?: () => void } = {}) => {
    const modal = useResponsiveModal({
        key: 'participant',
        views: ['create', 'update'],
        onOpen: () => {
            onOpen?.();
        },
    });

    const [participantId, setParticipantId] = useQueryState('participantId', parseAsString);

    return {
        modal,
        participantId,
        setParticipantId,
    };
};
