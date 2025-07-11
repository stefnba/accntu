import { parseAsBoolean, parseAsString, useQueryState } from 'nuqs';

/**
 * Hook to manage the add/update participant modal state
 */
export const useCreateUpdateParticipantModal = () => {
    const [modalIsOpen, setModalOpen] = useQueryState('m', parseAsBoolean.withDefault(false));
    const [participantId, setParticipantId] = useQueryState(
        'participantId',
        parseAsString.withDefault('')
    );

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };
    
    return {
        // Modal state
        modalIsOpen,
        setModal: (open: boolean) => {
            setModalOpen(open);
        },
        openModal,
        closeModal,

        // Participant state
        participantId,
        setParticipantId,
    };
};