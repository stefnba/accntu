import { parseAsStringLiteral, useQueryState } from 'nuqs';

const GLOBAL_BANK_ACCOUNT_DETAILS_VIEWS = [
    'overview',
    'transformations',
    'test-data',
    'analytics',
    'settings',
] as const;
export type TGlobalBankAccountDetailsView = (typeof GLOBAL_BANK_ACCOUNT_DETAILS_VIEWS)[number];

export const useGlobalBankAccountDetailsView = () => {
    const [view, setView] = useQueryState(
        'view',
        parseAsStringLiteral(GLOBAL_BANK_ACCOUNT_DETAILS_VIEWS).withDefault(
            GLOBAL_BANK_ACCOUNT_DETAILS_VIEWS[0]
        )
    );

    return {
        views: GLOBAL_BANK_ACCOUNT_DETAILS_VIEWS,
        currentView: view,
        setView,
    };
};
