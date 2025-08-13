import { useQueryStateTabsNav } from '@/components/tabs-query-state';

export const useTransactionDetails = () => {
    return useQueryStateTabsNav(
        [
            { label: 'Overview', value: 'overview' },
            { label: 'Amount', value: 'amount' },
            { label: 'Details', value: 'details' },
            { label: 'Banking', value: 'banking' },
            { label: 'Metadata', value: 'metadata' },
        ] as const,
        {
            defaultTab: 'overview',
        }
    );
};
