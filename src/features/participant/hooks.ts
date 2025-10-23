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
        modal: {
            ...modal,
            open: (view: 'create' | { participantId: string; view: 'update' } = 'create') => {
                if (typeof view === 'string') {
                    modal.open(view);
                } else if (view?.participantId) {
                    modal.open(view.view);
                    setParticipantId(view.participantId);
                }
                setParticipantId(null);
            },
        },
        participantId,
        setParticipantId,
    };
};
