import { transactionActions } from '@/actions';
import { PageHeader } from '@/components/page/header';
import {
    HydrationBoundary,
    QueryClient,
    dehydrate
} from '@tanstack/react-query';

import { TransactionTable } from './_components/table';
import {
    DEFAULT_FILTERS,
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE
} from './_components/table/store';

interface Props {
    params: {
        id: string;
    };
}

export default async function Transaction({}: Props) {
    const queryClient = new QueryClient();

    const pageSize = DEFAULT_PAGE_SIZE;
    const page = DEFAULT_PAGE;
    const filters = DEFAULT_FILTERS;

    await queryClient.prefetchQuery({
        queryKey: ['transactions', { pageSize, page }, { filters }],
        queryFn: () => transactionActions.list({ pageSize, page, ...filters })
    });

    return (
        <div>
            <PageHeader title="Transactions" />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <TransactionTable />
            </HydrationBoundary>
        </div>
    );
}
