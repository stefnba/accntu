import { useQueryStateTabsNav } from '@/components/tabs-query-state';

export const useTransactionDetails = () => {
    return useQueryStateTabsNav(
        [
            { label: 'Details', value: 'details' },
            { label: 'Banking', value: 'banking' },
            { label: 'Amount', value: 'amount' },
            { label: 'Metadata', value: 'metadata' },
        ] as const,
        {
            defaultTab: 'details',
        }
    );
};
