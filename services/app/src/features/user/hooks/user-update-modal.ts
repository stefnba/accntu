import { parseAsStringLiteral, useQueryState } from 'nuqs';

const updateSections = ['name', 'email', 'picture'] as const;

export const useUserUpdateModal = () => {
    const [update, setUpdate] = useQueryState(
        'update',
        parseAsStringLiteral(updateSections)
    );

    return {
        isOpen: !!update,
        type: update,
        handleOpen: (type: (typeof updateSections)[number]) => setUpdate(type),
        handleClose: () => setUpdate(null)
    };
};
